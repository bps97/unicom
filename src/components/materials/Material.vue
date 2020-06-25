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
                       :options="parentCategoryList"
                       :props="cascaderProps"
                       v-model="selectedKeys"
                       @change="parentCateChanged">
          </el-cascader>
        </el-col>
        <el-col :span="6">
          <el-input placeholder="请输入关键字"
                    v-model="queryInfo.key"
                    clearable
                    @clear="listMaterials">
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="listMaterials"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"
                     @click="showAddMaterialDialog">添加物料</el-button>
        </el-col>
      </el-row>
      <br>
      <!-- table表格区域 -->
      <el-table :data="materialList"
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
      <!-- 添加物料的对话框 -->
      <el-dialog title="添加物料"
                 :visible.sync="addMaterialDialogVisible"
                 width="50%"
                 @close="addMaterialDialogClosed">
        <!-- 添加分类的表单 -->

        <el-form :model="addMaterialForm"
                 ref="addMaterialFormRef"
                 label-width="100px">
          <el-form-item label="分类名称："
                        prop="name">
            <el-input placeholder="暂时不可用"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="addMaterialDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="addMaterial">确 定</el-button>
        </span>
      </el-dialog>
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
      materialList: undefined,
      // 总数据条数
      total: 0,
      // 父级分类的列表
      parentCategoryList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        checkStrictly: true
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 控制添加w物料对话框的显示与隐藏
      addMaterialDialogVisible: false,
      addMaterialForm: undefined
    }
  },
  created() {
    // 先获取父级分类的数据列表
    this.getParentcateList()
  },
  methods: {
    // 点击按钮，展示添加物料的对话框
    showAddMaterialDialog() {
      this.addMaterialDialogVisible = true
    },
    // 监听添加物料对话框的关闭事件
    addMaterialDialogClosed() {
      this.$refs.addMaterialFormRef.resetFields()
    },

    handleSizeChange(newSize) {
      this.queryInfo.size = newSize
      this.listMaterials()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      this.listMaterials()
    },

    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // console.log(this.selectedKeys)
      if (this.selectedKeys !== undefined) {
        if (this.selectedKeys.length > 0) {
          this.queryInfo.categoryId = this.selectedKeys[
            this.selectedKeys.length - 1
          ]
        }
      }
    },

    // 后端数据接口👇

    // 删除指定物料
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
      this.listMaterials()
    },

    // 点击按钮，添加新的物料
    addMaterial() {
      this.$refs.addMaterialFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'material/add',
          this.addMaterialForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.addMaterialDialogVisible = false
      })
    },

    // 请求获取分类菜单
    async getParentcateList() {
      const { data: res } = await this.$http.get('category/menus', {})

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      this.parentCategoryList = res.data
    },

    // 根据分页信息请求对应的物料列表
    async listMaterials() {
      const { data: res } = await this.$http.get('material', {
        params: {
          current: this.queryInfo.page,
          size: this.queryInfo.size,
          categoryId: this.queryInfo.categoryId,
          key: this.queryInfo.key
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.$message.success('获取商品列表成功！')
      this.materialList = res.data.records
      console.log(this.materialList)
      this.total = res.data.total
    }
  }
}
</script>

<style lang="less" scoped>
</style>
