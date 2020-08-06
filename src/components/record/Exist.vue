<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>物料出入库</el-breadcrumb-item>
      <el-breadcrumb-item>逐项出库</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="出库物料添加"
                type="info"
                center
                show-icon
                :closable="false">
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :active="activeIndex - 0"
                finish-status="success"
                align-center>
        <el-step title="物料信息"></el-step>
        <el-step title="已添清单"></el-step>

      </el-steps>

      <el-form ref="materialForm"
               :model="materialForm"
               :rules="materialFormRules"
               label-width="80px">

        <el-tabs v-model="activeIndex"
                 :tab-position="'left'"
                 :before-leave="beforeTabLeave">
          <el-tab-pane label="物料信息"
                       name="0">
            <el-form-item label="物料情况"
                          prop="status">
              <el-radio v-model="materialForm.status"
                        label="正常">正常</el-radio>
              <el-radio v-model="materialForm.status"
                        label="损坏">损坏</el-radio>
            </el-form-item>
            <el-form-item label="仓库位置"
                          prop="warehouse">
              <el-select v-model="materialForm.warehouse"
                         placeholder="请选择仓库"
                         value-key="key">
                <el-option v-for="item in warehouseNames"
                           :key='item.key'
                           :label='item.value'
                           :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="物料分类">
              <el-cascader props.expandTrigger="hover"
                           :options="parentcateList"
                           :props="cascaderProps"
                           v-model="selectedKeys"
                           @change="parentCateChanged"
                           placeholder="请选择分类"
                           clearable
                           style="width:400px"
                           props.checkStrictly>
              </el-cascader>
            </el-form-item>

            <el-form-item label="物料名称"
                          prop="material">
              <el-select v-model="materialForm.material"
                         placeholder="请选择物料"
                         value-key='id'
                         @change="changeMaterialOption">
                <el-option v-for="item in materialList"
                           :key='item.id'
                           :label='item.name'
                           :value='item'>
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.count }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="物料数量">
              <el-col :span='8'>
                <el-slider v-model="materialForm.count"
                           :show-tooltip="false"
                           :min=0
                           :max="maxCount"
                           show-input>
                </el-slider>
              </el-col>
            </el-form-item>

            <el-form-item>
              <el-button type="success"
                         @click="addToList">添加到申请单</el-button>
              <el-button type="primary"
                         @click="nextStep">查看申请单</el-button>
              <el-button @click="resetForm('materialForm')">清空</el-button>
            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="已添清单"
                       name="1">
            <!-- 申请单表 -->
            <el-table :data="applicationItemList"
                      style="width: 100%"
                      height="300">
              <el-table-column type="index"></el-table-column>
              <el-table-column prop="materialName"
                               label="物料名称">
              </el-table-column>
              <el-table-column prop="status"
                               width="50px"
                               align="center"
                               label="物料状态">
              </el-table-column>
              <el-table-column prop="specialLine"
                               width="50px"
                               align="center"
                               label="专业线">
              </el-table-column>
              <el-table-column prop="warehouseName"
                               label="所在仓库"
                               width="100">
              </el-table-column>
              <el-table-column prop="categoryName"
                               label="所属分类"
                               align="center">
              </el-table-column>
              <el-table-column prop="count"
                               label="数量"
                               width="100">
              </el-table-column>
              <el-table-column fixed="right"
                               label="操作"
                               width="120">
                <template slot-scope="scope">
                  <el-button @click.native.prevent="removeRow(scope.$index, applicationItemList)"
                             type="text"
                             size="small">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <br>
            <el-form-item label="备注信息">
              <el-col :span="12">
                <el-input type="textarea"
                          v-model="applicationForm.message"></el-input>
              </el-col>
            </el-form-item>
            <el-form-item>
              <el-button type="primary"
                         @click="alertSubmit">提交申请单</el-button>
              <el-button type="success"
                         @click="preStep">返回继续添加</el-button>
              <span slot="footer"
                    class="dialog-footer">
                <el-button>取 消</el-button>
                <el-button type="primary">确 定</el-button>
              </span>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

  </div>
</template>

<script>
export default {
  data () {
    return {
      materialForm: {
        material: [],
        warehouse: [],
        categoryId: '',
        specialLineId: '',
        status: '正常',
        count: 1,
        type: '逐项出库'
      },
      applicationForm: {
        message: '',
        type: '逐项出库'
      },
      maxCount: 1,
      warehouseNames: [],
      applicationItemList: [],
      parentcateList: [],
      materialList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 默认激活索引
      activeIndex: 0,

      materialFormRules: {
        status: [
          { required: true, message: '请选择物料情况', trigger: 'change' }
        ],
        warehouse: [
          { required: true, message: '请选择仓库位置', trigger: 'change' }
        ],
        material: [
          { required: true, message: '请填写物料名称', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    this.getParentcateList()
    this.listWarehouses()
  },
  methods: {

    changeMaterialOption (item) {
      this.maxCount = item.count
    },
    // 选择项发生变化触发这个函数
    parentCateChanged () {
      console.log(this.selectedKeys)
      this.materialList = undefined
      this.materialForm.material = undefined
      if (this.selectedKeys !== undefined && this.selectedKeys.length > 1) {
        this.materialForm.categoryId = this.selectedKeys[this.selectedKeys.length - 1]
        this.materialForm.specialLineId = this.selectedKeys[0] // 专业线
      }
      this.listMaterialOptions()
    },
    // 获取父级分类
    async getParentcateList () {
      const { data: res } = await this.$http.get('category/menus', {})

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentcateList = res.data
    },
    addToList () {
      // 验证表单
      this.$refs.materialForm.validate(async valid => {
        if (!valid) {
          return
        }
        // 提交申请单
        this.alertSubmitItem()
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
      this.selectedKeys = []
    },
    // 提交申请单项
    async alertSubmitItem () {
      const { data: res } = await this.$http.post('applyItem', {
        materialName: this.materialForm.material.name,
        materialId: this.materialForm.material.id,
        warehouseId: this.materialForm.warehouse.key,
        warehouseName: this.materialForm.warehouse.value,
        categoryId: this.materialForm.categoryId,
        specialLineId: this.materialForm.specialLineId,
        count: this.materialForm.count,
        status: this.materialForm.status,
        type: this.materialForm.type
      })
      if (res.meta.status !== 201) {
        this.$message.error(res.meta.message)
        return
      }
      this.resetForm('materialForm')
      this.$message.success('提交申请成功！')
    },

    // 提交申请单
    async alertSubmit () {
      const { data: res } = await this.$http.put('apply/message', {
        message: this.materialForm.message,
        type: this.materialForm.type
      })
      if (res.meta.status !== 200) {
        return this.$message.error('提交申请失败！')
      }
      this.$message.success('申请成功!')
      this.activeIndex = '0'
    },
    // 获取物料选项列表
    async listMaterialOptions () {
      const { data: res } = await this.$http.get('material/options', {
        params: {
          warehouseId: this.materialForm.warehouse.key,
          categoryId: this.materialForm.categoryId,
          status: this.materialForm.status
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.materialList = res.data
    },
    // 获取仓库列表
    async listWarehouses () {
      const { data: res } = await this.$http.get('warehouse/names')

      if (res.meta.status !== 200) {
        return this.$message.error('获取仓库列表失败！')
      }

      this.warehouseNames = res.data
    },
    // 获取申请单项
    async listItems () {
      const { data: res } = await this.$http.get('applyItem', {
        params: {
          type: this.materialForm.type
        }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取申请单列表失败！')
      }
      this.applicationItemList = res.data
      return this.applicationItemList
    },
    async removeItem (id) {
      const { data: res } = await this.$http.delete('applyItem/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
    },
    // 下一步
    nextStep () {
      this.activeIndex = '1'
      this.listItems()
    },
    preStep () {
      this.activeIndex = '0'
    },
    // 立即提交申请
    myAlert () {
      this.$confirm('此操作将直接提交申请, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => { })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已撤销'
          })
        })
    },
    // 检测页签变化
    beforeTabLeave (activeName, oldActiveName) {
      if (activeName === '1') {
        var res = this.listItems()
        if (res.length === 0) {
          this.$message({
            type: 'info',
            message: '请至少添加一种物料'
          })
          return false
        }
      }
      return true
    },
    removeRow (index, rows) {
      this.removeItem(rows[index].id)
      rows.splice(index, 1)
    }
  },
  mounted () {
  }
}
</script>

<style lang="less" scoped>
</style>
