<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>物料出入库</el-breadcrumb-item>
      <el-breadcrumb-item>逐项入库</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="入库物料添加" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="物料信息"></el-step>
        <el-step title="已添清单"></el-step>
      </el-steps>

      <el-form
        ref="materialForm"
        :model="materialForm"
        :rules="materialFormRules"
        label-width="80px"
      >
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave">
          <el-tab-pane label="物料信息" name="0" v-loading="loading">
            <el-form-item label="所在仓库" >
              <el-tag type="success" v-if="warehouseName !== ''">{{warehouseName}}</el-tag>
            </el-form-item>
            <el-form-item label="物料情况" prop="status">
              <el-radio v-model="materialForm.status" label="正常">正常</el-radio>
              <el-radio v-model="materialForm.status" label="损坏">损坏</el-radio>
            </el-form-item>

            <el-form-item label="物料分类">
              <el-cascader
                props.expandTrigger="hover"
                :options="parentCategoryList"
                :props="cascaderProps"
                v-model="selectedKeys"
                @change="parentCateChanged"
                placeholder="请选择分类"
                clearable
                style="width:400px"
                props.checkStrictly
              ></el-cascader>
            </el-form-item>
            <el-form-item label="物料名称" prop="materialName">
              <el-autocomplete
                class="inline-input"
                v-model="materialForm.materialName"
                :fetch-suggestions="querySearch"
                placeholder="请输入内容"
                @select="handleSelect"
                style="width:400px"
                :rows="2"
                type="textarea"
              ></el-autocomplete>
            </el-form-item>
            <el-form-item label="物料数量">
              <el-col :span="10">
                <el-slider
                  v-model="materialForm.count"
                  :show-tooltip="false"
                  :min="1"
                  :max="300"
                  show-input
                ></el-slider>
              </el-col>
            </el-form-item>
            <el-form-item>
              <el-button type="success" @click="addToList">添加到申请单</el-button>
              <el-button type="primary" @click="nextStep">查看申请单</el-button>
              <el-button @click="resetForm('materialForm')">清空</el-button>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="已添清单" name="1">
            <!-- 已添清单 -->
            <el-table :data="applicationItemList" style="width: 100%" height="300">
              <el-table-column type="index"></el-table-column>
              <el-table-column prop="materialName" label="物料名称"></el-table-column>
              <el-table-column prop="status" width="50px" align="center" label="物料状态"></el-table-column>
              <el-table-column prop="specialLine" width="50px" align="center" label="专业线"></el-table-column>
              <el-table-column prop="warehouseName" label="所在仓库" width="100"></el-table-column>
              <el-table-column prop="categoryName" label="所属分类" align="center"></el-table-column>
              <el-table-column prop="count" label="数量" width="100"></el-table-column>
              <el-table-column fixed="right" label="操作" width="120">
                <template slot-scope="scope">
                  <el-button
                    @click.native.prevent="removeRow(scope.$index, applicationItemList)"
                    type="text"
                    size="small"
                  >移除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <br />
            <el-form-item label="备注信息">
              <el-col :span="12">
                <el-input type="textarea" v-model="applicationForm.message"></el-input>
              </el-col>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="alertSubmit">提交申请单</el-button>
              <el-button type="success" @click="preStep">返回继续添加</el-button>
              <span slot="footer" class="dialog-footer">
                <el-button>取 消</el-button>
                <el-button type="primary">确 定</el-button>
              </span>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 修改分类的对话框 -->
    <el-dialog title="选择仓库" :visible.sync="warehouseDialogVisible" width="50%" center
               :before-close="beforeClose"
               @close="warehouseDialogVisible = false"  >
      <el-radio
        v-model="warehouseName"
        v-for="item in warehouseList"
        :key="item.id" :label="item.name"
        @change="chooseWarehouse(item)"
        border>
      </el-radio>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      warehouseDialogVisible: true,
      warehouseList: undefined,
      warehouseName: '',
      warehouseId: '',
      materialForm: {
        materialId: '',
        materialName: '',
        categoryId: '',
        status: '正常',
        count: 1,
        type: '逐项入库'
      },
      applicationForm: {
        message: '',
        type: '逐项入库'
      },
      applicationItemList: [],
      materialNames: [],
      parentCategoryList: [],
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
      loading: false,

      materialFormRules: {
        status: [
          { required: true, message: '请选择物料情况', trigger: 'change' }
        ],
        materialName: [
          { required: true, message: '请填写物料名称', trigger: 'change' }
        ]
      }

    }
  },
  created () {
    this.listWarehouses()
    this.listParentCategory()
  },
  methods: {
    chooseWarehouse(item) {
      this.warehouseDialogVisible = false
      this.warehouseId = item.id
    },
    beforeClose(done) {
      if (this.warehouseList !== null) {
        const item = this.warehouseList[0]
        this.warehouseName = item.name
        this.warehouseId = item.id
      }
      done()
    },
    querySearch (queryString, cb) {
      var materialnames = this.materialNames
      var results = queryString
        ? materialnames.filter(this.createFilter(queryString))
        : materialnames
        // 调用 callback 返回建议列表的数据
      cb(results)
      console.log(this.materialForm)
    },
    createFilter (queryString) {
      return restaurant => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    handleSelect (item) {
      this.materialForm.materialId = item.key
    },
    // 选择项发生变化触发这个函数
    parentCateChanged () {
      // console.log(this.selectedKeys)
      this.materialName = ''
      if (this.selectedKeys !== undefined && this.selectedKeys.length > 1) {
        this.materialForm.categoryId = this.selectedKeys[this.selectedKeys.length - 1]
        this.materialForm.specialLineId = this.selectedKeys[0] // 专业线
        this.listMaterialNames()
      }
    },
    // 获取父级分类
    async listParentCategory () {
      const { data: res } = await this.$http.get('category/menus', {})

      if (res.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCategoryList = res.data
    },
    addToList () {
      // 验证表单
      this.$refs.materialForm.validate(async valid => {
        if (!valid) {
          return
        }
        this.loading = true
        this.checkMaterial()
      })
    },
    async checkMaterial () {
      const { data: res } = await this.$http.get('apply/material/check', {
        params: {
          materialName: this.materialForm.materialName,
          warehouseId: this.warehouseId,
          warehouseName: this.warehouseName,
          categoryId: this.materialForm.categoryId,
          specialLineId: this.materialForm.specialLineId,
          count: this.materialForm.count,
          status: this.materialForm.status,
          type: this.materialForm.type
        }
      })
      if (res.status !== 200) {
        return this.$message.error(res.message)
      }
      this.materialForm.materialId = res.data.id
      // 提交申请单
      this.alertSubmitItem()
      this.loading = false
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
      this.selectedKeys = []
    },
    // 提交申请单项
    async alertSubmitItem () {
      const { data: res } = await this.$http.post('apply', {
        materialId: this.materialForm.materialId,
        materialName: this.materialForm.materialName,
        warehouseId: this.warehouseId,
        warehouseName: this.warehouseName,
        categoryId: this.materialForm.categoryId,
        specialLineId: this.materialForm.specialLineId,
        count: this.materialForm.count,
        status: this.materialForm.status,
        type: this.materialForm.type
      })
      if (res.status !== 201) {
        return this.$message.error(res.message)
      }
      this.resetForm('materialForm') // 清空表单
      this.$message.success(res.message)
    },

    // 获取物料名称
    async listMaterialNames () {
      const { data: res } = await this.$http.get('material/names', {
        params: {
          warehouseId: this.warehouseId,
          categoryId: this.materialForm.categoryId,
          status: this.materialForm.status
        }
      })

      if (res.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.materialNames = res.data
    },
    // 获取仓库列表
    async listWarehouses () {
      const { data: res } = await this.$http.get('warehouse/list')

      if (res.status !== 200) {
        return this.$message.error('获取仓库列表失败！' + res.message)
      }
      this.warehouseList = res.data
    },
    // 获取申请单项
    async listApplicationItems () {
      const { data: res } = await this.$http.get('apply', {
        params: {
          type: this.applicationForm.type
        }
      })

      if (res.status !== 200) {
        return this.$message.error('获取申请单列表失败！' + res.message)
      }
      this.applicationItemList = res.data
      return this.applicationItemList
    },
    async removeItem (id) {
      const { data: res } = await this.$http.delete('apply/' + id)
      if (res.status !== 200) {
        return this.$message.error('删除失败！')
      }
    },
    // 下一步
    nextStep () {
      this.activeIndex = '1'
      this.listApplicationItems()
    },
    preStep () {
      this.activeIndex = '0'
    },
    // 立即提交申请
    alertSubmit () {
      this.$confirm('此操作将直接提交申请, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.submitApplication()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已撤销'
          })
        })
    },
    // 提交申请单
    async submitApplication () {
      const { data: res } = await this.$http.put('apply/message', this.applicationForm)
      if (res.status !== 200) {
        return this.$message.error('提交申请失败！' + res.message)
      }
      this.$message.success('申请成功!')
      this.activeIndex = '0'
    },
    // 检测页签变化
    beforeTabLeave (activeName, oldActiveName) {
      if (activeName === '1') {
        var res = this.listApplicationItems()
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
