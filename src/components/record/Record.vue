<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>审批流程</el-breadcrumb-item>
      <el-breadcrumb-item>领用录入</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加物料信息"
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
        <el-step title="申请情况"></el-step>

      </el-steps>

      <el-form ref="recordForm"
               :model="recordForm"
               :rules="recordFormRules"
               label-width="80px">

        <el-tabs v-model="activeIndex"
                 :tab-position="'left'"
                 :before-leave="beforeTabLeave">
          <el-tab-pane label="物料信息"
                       name="0">
            <el-form-item label="仓库位置"
                          prop="repositoryId">
              <el-select v-model="recordForm.repositoryId"
                         placeholder="请选择仓库">
                <el-option v-for="item in repoList"
                           :key='item.key'
                           :label='item.value'
                           :value="item.key"></el-option>

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
                          prop="materialName">
              <el-autocomplete class="inline-input"
                               v-model="recordForm.materialName"
                               :fetch-suggestions="querySearch"
                               placeholder="请输入内容"
                               @select="handleSelect"
                               style="width:400px"
                               :rows="2"
                               type="textarea">
              </el-autocomplete>
            </el-form-item>
            <el-form-item>
              <el-radio v-model="recordForm.status"
                        label="正常">正常</el-radio>
              <el-radio v-model="recordForm.status"
                        label="损坏">损坏</el-radio>
            </el-form-item>
            <el-form-item label="物料数量">
              <el-col :span='8'>
                <el-slider v-model="recordForm.count"
                           :show-tooltip="false"
                           show-input>
                </el-slider>
              </el-col>
            </el-form-item>

            <el-form-item>
              <el-button type="success"
                         @click="onSubmit">添加</el-button>
              <el-button type="primary"
                         @click="nextStep">下一步</el-button>
              <el-button @click="resetForm('recordForm')">清空</el-button>
            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="申请情况"
                       name="1">
            <!-- 申请单表 -->
            <el-table :data="applicationItems"
                      style="width: 100%"
                      height="300">
              <el-table-column type="index"></el-table-column>
              <el-table-column prop="materialName"
                               label="物料名称">
              </el-table-column>
              <el-table-column prop="status" width="50px" align="center"
                               label="物料状态">
              </el-table-column>
              <el-table-column prop="specialLine" width="50px" align="center"
                               label="专业线"
                               >
              </el-table-column>
              <el-table-column prop="repositoryName"
                               label="所在仓库"
                               width="100">
              </el-table-column>
              <el-table-column prop="categoryName"
                               label="所属分类" align="center"
                               >
              </el-table-column>
              <el-table-column prop="count"
                               label="数量"
                               width="100">
              </el-table-column>
              <el-table-column fixed="right"
                               label="操作"
                               width="120">
                <template slot-scope="scope">
                  <el-button @click.native.prevent="deleteRow(scope.$index, applicationItems)"
                             type="text"
                             size="small">
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <br>
            <el-form-item label="使用原因">
              <el-col :span="12">
                <el-input type="textarea"
                          v-model="recordForm.message"></el-input>
              </el-col>
            </el-form-item>
            <el-form-item>
              <el-button type="primary"
                         @click="submitApplyForm">立即申请</el-button>
              <el-button type="success"
                         @click="preStep">继续添加</el-button>
              <span slot="
                         footer"
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
  data() {
    return {
      restaurants: [],
      recordForm: {
        materialId: '',
        materialName: '',
        message: '',
        count: 1,
        repositoryId: '',
        categoryId: '',
        status: '正常',
        type: '领用'
      },
      queryInfo: {
        categoryId: '',
        repositoryId: ''
      },
      repoList: [],
      parentcateList: [],
      applicationItems: [],
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

      recordFormRules: {
        repositoryId: [
          { required: true, message: '请选择仓库位置', trigger: 'change' }
        ],
        materialName: [
          { required: true, message: '请填写物料名称', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getParentcateList()
    this.listRepositories()
  },
  methods: {
    querySearch(queryString, cb) {
      var restaurants = this.restaurants
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
      console.log(this.recordForm)
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    },
    handleSelect(item) {
      this.recordForm.materialId = item.key
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // console.log(this.selectedKeys)
      this.materialName = ''
      if (this.selectedKeys !== undefined && this.selectedKeys.length > 1) {
        this.queryInfo.categoryId = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.listMaterials()
      }
    },
    // 获取父级分类
    async getParentcateList() {
      const { data: res } = await this.$http.get('category/menus', {})

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentcateList = res.data
    },
    onSubmit() {
      // 验证表单
      this.$refs.recordForm.validate(async valid => {
        if (!valid) {
          return
        }
        // 提交申请单
        this.submitApplyFormItem()
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.selectedKeys = []
    },
    // 提交申请单项
    async submitApplyFormItem() {
      this.recordForm.categoryId = this.queryInfo.categoryId
      const { data: res } = await this.$http.post('applyItem', this.recordForm)
      if (res.meta.status !== 201) {
        this.$message.error('添加成功失败！')
        return
      }
      this.clearForm()
      this.$message.success('提交申请成功！')
    },
    // 清空表单
    clearForm() {
      this.resetForm('recordForm')
      // this.form.count = 1
      // this.selectedKeys = []
    },
    // 提交申请单
    async submitApplyForm() {
      const { data: res } = await this.$http.post('apply/message', {
        message: this.recordForm.message,
        type: this.recordForm.type
      })
      if (res.meta.status !== 200) {
        return this.$message.error('提交申请失败！')
      }
      this.$message.success('申请成功!')
      this.activeIndex = '0'
    },
    // 获取物料列表
    async listMaterials() {
      this.queryInfo.repositoryId = this.recordForm.repositoryId
      const { data: res } = await this.$http.get('material/names', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }

      this.restaurants = res.data
    },
    // 获取仓库列表
    async listRepositories() {
      const { data: res } = await this.$http.get('repository/names')

      if (res.meta.status !== 200) {
        return this.$message.error('获取仓库列表失败！')
      }

      this.repoList = res.data
    },
    // 获取申请单项
    async listItems() {
      const { data: res } = await this.$http.get('applyItem')

      if (res.meta.status !== 200) {
        return this.$message.error('获取申请单列表失败！')
      }
      this.applicationItems = res.data
      return this.applicationItems
    },
    async removeItem(id) {
      const { data: res } = await this.$http.delete('applyItem/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
    },
    // 下一步
    nextStep() {
      this.activeIndex = '1'
      this.listItems()
    },
    preStep() {
      this.activeIndex = '0'
    },
    // 立即提交申请
    myAlert() {
      this.$confirm('此操作将直接提交申请, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {})
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已撤销'
          })
        })
    },
    // 检测页签变化
    beforeTabLeave(activeName, oldActiveName) {
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
    deleteRow(index, rows) {
      this.removeItem(rows[index].id)
      rows.splice(index, 1)
    }
  },
  mounted() {
    // this.restaurants = this.loadAll()
  }
}
</script>

<style lang="less" scoped>
</style>
