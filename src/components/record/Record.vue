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

      <el-form ref="recordFormRef"
               :model="form"
               label-width="80px">
        <el-form-item label="物料分类">
          <el-cascader expand-trigger="hover"
                       :options="parentcateList"
                       :props="cascaderProps"
                       v-model="selectedKeys"
                       @change="parentCateChanged"
                       placeholder="请选择分类"
                       clearable
                       @click="getMaterialList"
                       change-on-select
                       style="width:500px">
          </el-cascader>
        </el-form-item>
        <el-form-item label="物料名称">
          <el-autocomplete class="inline-input"
                           v-model="materialName"
                           :fetch-suggestions="querySearch"
                           placeholder="请输入内容"
                           clearable='true'
                           @select="handleSelect"
                           style="width:500px">
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
        <el-form-item label="仓库位置">
          <el-select v-model="form.repositoryId"
                     placeholder="请选择仓库">
            <el-option v-for="item in repoList"
                       :key='item.key'
                       :label='item.value'
                       :value="item.key"></el-option>

          </el-select>
        </el-form-item>

        <el-form-item label="使用原因">
          <el-col :span="12">
            <el-input type="textarea"
                      v-model="form.message"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     @click="onSubmit">立即创建</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

  </div>
</template>

<script>
export default {
  data() {
    return {
      restaurants: [],
      materialName: '',
      form: {
        materialId: '',
        message: '',
        count: 1,
        repositoryId: '',
        categoryId: ''
      },
      queryInfo: {
        categoryId: ''
      },
      repoList: [],
      parentcateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: []
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
      console.log(this.form)
      this.$refs.recordFormRef.validate(async valid => {
        this.form.categoryId = this.queryInfo.categoryId
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('record', this.form)

        if (res.meta.status !== 201) {
          this.$message.error('添加成功失败！')
        }

        this.$message.success('添加用户成功！')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getuserList()
      })
    },
    async getMaterialList() {
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
    }
  },
  mounted() {
    // this.restaurants = this.loadAll()
  }
}
</script>

<style lang="less" scoped>
</style>
