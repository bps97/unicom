<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>物料管理</el-breadcrumb-item>
      <el-breadcrumb-item>物料列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>

      <el-row :gutter="20">
        <!-- 选择商品分类区域 -->
        <el-col :span='5'>
          <el-cascader expand-trigger="hover"
                       :options="parentcateList"
                       :props="cascaderProps"
                       v-model="selectedKeys"
                       @change="parentCateChanged"
                       clearable
                       change-on-select>
          </el-cascader>
        </el-col>
        <el-col :span="6">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.key"
                    clearable
                    @clear="getGoodsList">
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"
                     @click="goAddpage">添加物料</el-button>
        </el-col>
      </el-row>
      <br>
      <!-- table表格区域 -->
      <el-table :data="goodslist"
                border
                stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="物料名称"
                         prop="name"></el-table-column>
        <el-table-column label="专业线"
                         prop="specialLine"
                         width="95px"></el-table-column>
        <el-table-column label="仓库"
                         prop="repositoryName"
                         width="95px"></el-table-column>
        <el-table-column label="物料数量"
                         prop="count"
                         width="70px"></el-table-column>
        <el-table-column label="更新时间"
                         prop="updateTime"
                         width="160px"></el-table-column>
        <el-table-column label="操作"
                         width="130px">
          <template slot-scope="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"></el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="removeById(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 15, 20]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total"
                     background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        key: '',
        page: 1,
        size: 10,
        categoryId: ''
      },
      // 分类列表
      catelist: [],
      // 商品列表
      goodslist: [],
      // 总数据条数
      total: 0,
      // 父级分类的列表
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
    console.log(this)
    // 先获取父级分类的数据列表
    this.getParentcateList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('material', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }

      this.$message.success('获取商品列表成功！')
      this.goodslist = res.data.content
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.size = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      this.getGoodsList()
    },
    async removeById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除！')
      }

      const { data: res } = await this.$http.delete(`goods/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }

      this.$message.success('删除成功！')
      this.getGoodsList()
    },
    goAddpage() {
      this.$router.push('/materials/add')
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // console.log(this.selectedKeys)
      if (this.selectedKeys !== undefined && this.selectedKeys.length > 1) {
        this.queryInfo.categoryId = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.getGoodsList()
      }
    },
    async getParentcateList() {
      const { data: res } = await this.$http.get('category/menus', {})

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      console.log(res.data)
      this.parentcateList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
</style>
