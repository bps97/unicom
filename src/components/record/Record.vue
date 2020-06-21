<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>审批流程</el-breadcrumb-item>
      <el-breadcrumb-item>日志录入</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息"
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
        <el-step title="最终结算"></el-step>

      </el-steps>

      <el-form ref="recordFormRef"
               :model="form"
               label-width="80px">

        <el-tabs v-model="activeIndex"
                 :tab-position="'left'"
                 :before-leave="beforeTabLeave">
          <el-tab-pane label="物料信息"
                       name="0">

            <el-form-item label="仓库位置">
              <el-select v-model="form.repositoryId"
                         placeholder="请选择仓库">
                <el-option v-for="item in repoList"
                           :key='item.key'
                           :label='item.value'
                           :value="item.key"></el-option>

              </el-select>
            </el-form-item>
            <el-form-item label="物料分类">
              <el-cascader expand-trigger="hover"
                           :options="parentcateList"
                           :props="cascaderProps"
                           v-model="selectedKeys"
                           @change="parentCateChanged"
                           placeholder="请选择分类"
                           clearable
                           style="width:400px"
                           change-on-select>
              </el-cascader>
            </el-form-item>
            <el-form-item label="物料名称">
              <el-autocomplete class="inline-input"
                               v-model="form.materialName"
                               :fetch-suggestions="querySearch"
                               placeholder="请输入内容"
                               @select="handleSelect"
                               style="width:400px"
                               :rows="2"
                               type="textarea">
              </el-autocomplete>
            </el-form-item>
            <el-form-item label="物料数量">
              <el-col :span='8'>
                <el-slider v-model="form.count"
                           :show-tooltip="false"
                           show-input>
                </el-slider>
              </el-col>
            </el-form-item>

            <el-form-item>
              <el-button type="primary"
                         @click="open">立即申请</el-button>
              <el-button type="success"
                         @click="onSubmit">继续添加</el-button>
              <el-button>取消</el-button>
            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="申请情况"
                       name="1">
            <!-- 申请单表 -->
            <el-table :data="APPItems"
                      style="width: 100%"
                      height="250">
              <el-table-column type="index"></el-table-column>
              <el-table-column prop="materialName"
                               label="物料名称">
              </el-table-column>
              <el-table-column prop="specialLine"
                               label="专业线"
                               width="100">
              </el-table-column>
              <el-table-column prop="categoryName"
                               label="所属分类"
                               width="100">
              </el-table-column>
              <el-table-column prop="repositoryName"
                               label="所在仓库"
                               width="100">
              </el-table-column>

              <el-table-column prop="count"
                               label="数量"
                               width="100">
              </el-table-column>
              <el-table-column fixed="right"
                               label="操作"
                               width="120">
                <template slot-scope="scope">
                  <el-button @click.native.prevent="deleteRow(scope.$index, tableData)"
                             type="text"
                             size="small">
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="最终结算"
                       name="2">
            <el-form-item label="使用原因">
              <el-col :span="12">
                <el-input type="textarea"
                          v-model="form.message"></el-input>
              </el-col>
            </el-form-item>
            <el-form-item>
              <el-button type="primary"
                         @click="submitApplication">立即申请</el-button>
              <el-button type="success">继续添加</el-button>
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
  data() {
    return {
      restaurants: [],
      form: {
        materialId: '',
        materialName: '',
        message: '',
        count: 1,
        repositoryId: '',
        categoryId: ''
      },
      queryInfo: {
        categoryId: '',
        repositoryId: ''
      },
      repoList: [],
      parentcateList: [],
      APPItems: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 默认激活索引
      activeIndex: 0
    }
  },
  created() {
    this.getParentcateList()
    this.getRepoList()
  },
  methods: {
    querySearch(queryString, cb) {
      var restaurants = this.restaurants
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
      console.log(this.form)
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
      this.form.materialId = item.key
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // console.log(this.selectedKeys)
      this.materialName = ''
      if (this.selectedKeys !== undefined && this.selectedKeys.length > 1) {
        this.queryInfo.categoryId = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.getMaterialList()
      }
    },
    async getParentcateList() {
      const { data: res } = await this.$http.get('category/menus', {})

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      console.log(res.data)
      this.parentcateList = res.data
    },
    onSubmit() {
      // console.log(this.form)
      this.$refs.recordFormRef.validate(async valid => {
        this.form.categoryId = this.queryInfo.categoryId
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post(
          'applicationItem',
          this.form
        )

        if (res.meta.status !== 201) {
          this.$message.error('添加成功失败！')
        }

        this.form = []
        this.form.count = 1
        this.selectedKeys = []
        this.$message.success('提交申请成功！')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getuserList()
      })
    },
    async submitApplication() {
      const { data: res } = await this.$http.post('application/message', {
        message: this.form.message
      })
      if (res.meta.status !== 200) {
        return this.$message.error('提交申请失败！')
      }
      this.activeIndex = 2
    },
    async getMaterialList() {
      this.queryInfo.repositoryId = this.form.repositoryId
      const { data: res } = await this.$http.get('material/names', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }

      this.restaurants = res.data
    },
    async getRepoList() {
      const { data: res } = await this.$http.get('repository/names')

      if (res.meta.status !== 200) {
        return this.$message.error('获取仓库列表失败！')
      }

      this.repoList = res.data
    },
    async getItems() {
      const { data: res } = await this.$http.get('applicationItem')

      if (res.meta.status !== 200) {
        return this.$message.error('获取申请单列表失败！')
      }

      this.APPItems = res.data
    },
    // 立即提交申请
    open() {
      this.$confirm('此操作将直接提交申请, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已撤销'
          })
        })
    },

    beforeTabLeave(activeName, oldActiveName) {
      // console.log(activeName)
      // console.log(activeName === '1')
      if (activeName === '1') {
        console.log(oldActiveName)
        console.log(activeName)
        this.getItems()
      }
      if (oldActiveName === '2') {
        return false
      }
      return true
    },
    deleteRow(index, rows) {
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
