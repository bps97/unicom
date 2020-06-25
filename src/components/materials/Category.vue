<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>物料管理</el-breadcrumb-item>
      <el-breadcrumb-item>物料分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>

      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="showAddCategoryDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName"
               @tab-click="shiftTabs">
        <el-tab-pane v-for='item in categoryData'
                     :key='item.id'
                     :label='item.name'
                     :name='item.id'>
        </el-tab-pane>
        <!-- 表格 -->
        <tree-table class="treeTable"
                    :data="categoryList"
                    :columns="columns"
                    :selection-type="false"
                    :expand-type="false"
                    show-index
                    index-text="序号"
                    stripe
                    :show-row-hover="false">
          <!-- 排序 -->
          <template slot="order"
                    slot-scope="scope">
            <el-tag size="mini"
                    v-if="scope.row.level===1">一级</el-tag>
            <el-tag type="success"
                    size="mini"
                    v-else-if="scope.row.level===2">二级</el-tag>
            <el-tag type="warning"
                    size="mini"
                    v-else>三级</el-tag>
          </template>
          <!-- 是否有效 -->
          <template slot="isok"
                    slot-scope="scope">
            <el-switch v-model="scope.row.available"
                       @change="closeAvailable(scope.row)">
            </el-switch>
          </template>
          <!-- 操作 -->
          <template slot="opt"
                    slot-scope="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="removeById(scope.row.id)">删除</el-button>
          </template>
        </tree-table>

        <!-- 分页区域 -->
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="querInfo.page"
                       :page-sizes="[3, 5, 10, 15]"
                       :page-size="querInfo.size"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="total">
        </el-pagination>
      </el-tabs>
    </el-card>

    <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类"
               :visible.sync="editDialogVisible"
               width="50%"
               @close="editDialogClosed">
      <el-form :model="editForm"
               ref="editFormRef"
               label-width="70px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="专业线"
                      prop="specialLine">
          <el-input v-model="editForm.specialLine"
                    disabled></el-input>
        </el-form-item>
        <el-form-item label="等级"
                      prop="level">
          <el-input v-model="editForm.level"
                    disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类"
               :visible.sync="addCategoryDialogVisible"
               width="50%"
               @close="addCategoryDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCategoryFrom"
               :rules="addCategoryFromRules"
               ref="addCategoryFromRef"
               label-width="100px">
        <el-form-item label="父级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader expand-trigger="hover"
                       :options="parentCategoryList"
                       :props="cascaderProps"
                       v-model="selectedKeys"
                       @change="parentCategoryChanged"
                       clearable>
          </el-cascader>
        </el-form-item>
        <el-form-item label="分类名称："
                      prop="name">
          <el-input v-model="addCategoryFrom.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        level: '',
        page: 1,
        size: 5
      },
      activeName: '无线',
      // 商品分类的数据列表，默认为空
      categoryList: [],
      // 总的数据
      categoryData: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'name'
        },
        {
          label: '类别等级',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'order'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '操作',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCategoryDialogVisible: false,
      // 添加分类的表单数据对象
      addCategoryFrom: {
        // 将要添加的分类的名称
        name: '',
        // 父级分类的Id
        parentId: 0
      },
      // 添加分类表单的验证规则对象
      addCategoryFromRules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
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
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {}
    }
  },
  created() {
    this.getcategoryList()
  },
  methods: {
    // 监听 switch 开关状态的改变
    async closeAvailable(user) {
      const { data: res } = await this.$http.put(
        `category/${user.id}/available/${user.available}`
      )
      if (res.meta.status !== 200) {
        user.available = !user.available
        return this.$message.error('更新分类有效性失败！')
      }
      this.$message.success('更新分类有效性成功！')
    },
    // 切换标签
    shiftTabs() {
      // console.log(this.activeName)
      // this.categoryData.forEach(item => console.log(item.id))
      var temp = this.categoryData.filter(
        item => item.id === this.activeName
      )[0]
      this.categoryList = temp.children != null ? temp.children : []
      this.total = this.categoryList.length
    },

    // 获取商品分类数据
    async getcategoryList() {
      const { data: res } = await this.$http.get('category', {
        params: this.querInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      console.log(res.data)
      // 把数据列表，赋值给 categoryList
      this.categoryData = res.data.records
      this.categoryList = this.categoryData[0].children
      // 为总数据条数赋值
      this.total = this.categoryList.length
    },
    // 监听 size 改变
    handleSizeChange(newSize) {
      this.querInfo.size = newSize
      this.getcategoryList()
    },
    // 监听 page 改变
    handleCurrentChange(newPage) {
      this.querInfo.page = newPage
      this.getcategoryList()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCategoryDialog() {
      // 先获取父级分类的数据列表
      this.getParentcategoryList()
      // 再展示出对话框
      this.addCategoryDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentcategoryList() {
      const { data: res } = await this.$http.get('category/menus', {})

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      console.log(res.data)
      this.parentCategoryList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCategoryChanged() {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCategoryFrom.parentId = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
      } else {
        // 父级分类的Id
        this.addCategoryFrom.parentId = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCategoryFromRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'category/add',
          this.addCategoryFrom
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getcategoryList()
        this.addCategoryDialogVisible = false
        this.shiftTabs()
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCategoryDialogClosed() {
      this.$refs.addCategoryFromRef.resetFields()
      this.selectedKeys = []
      this.addCategoryFrom.parentId = 0
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('category/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('查询分类信息失败！')
      }

      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改分类信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          'category/' + this.editForm.id,
          {
            name: this.editForm.name
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('更新分类信息失败！')
        }
        // 提示修改成功
        this.$message.success('更新分类信息成功！，注：页面未同步')
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.shiftTabs()
      })
    },
    // 根据Id删除对应的用户信息
    async removeById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('category/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除该分类失败！')
      }

      this.$message.success('删除该分类成功！')
      this.shiftTabs()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
