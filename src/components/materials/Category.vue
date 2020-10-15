<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>物料管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-popover placement="right" title="点击添加『物料分类』" trigger="hover" content="注意分类命名要有辨识度">
            <el-button type="primary" slot="reference" @click="showAddCategoryDialog">添加分类</el-button>
          </el-popover>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="shiftTabs">
        <el-tab-pane
          v-for="item in specialLineList"
          :key="item.key"
          :label="item.value"
          :name="item.key"
        />
        <!-- 表格 -->
        <el-table
          :data="categoryList"
          row-key="id"
          style="width: 100%;margin-bottom: 20px;"
          border
          :max-height="pageHeight-300"
          stripe
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        >
          <el-table-column label="展开" align="left" width="60px">
          </el-table-column>
          <el-table-column prop="name" label="分类名称" sortable />
          <el-table-column label="类别等级" width="100px" align="center">
            <!-- 排序 -->
            <template slot-scope="scope">
              <el-tag size="mini" v-if="scope.row.level===1">一级</el-tag>
              <el-tag type="success" size="mini" v-else-if="scope.row.level===2">二级</el-tag>
              <el-tag type="warning" size="mini" v-else>三级</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="有效性" width="66px">
            <!-- 是否有效 -->
            <template slot-scope="scope">
              <el-switch v-model="scope.row.available" @change="closeAvailable(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200px" align="center">
            <!-- 操作 -->
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              >编辑</el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeById(scope.row.id)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.page"
          :page-sizes="[5, 8, 10, 15]"
          :page-size="queryInfo.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </el-tabs>
    </el-card>

    <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" ref="editFormRef" label-width="70px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="专业线" prop="specialLine">
          <el-input v-model="editForm.specialLine" disabled />
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-input v-model="editForm.level" disabled />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCategoryInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCategoryDialogVisible"
      width="50%"
      @close="addCategorygoryDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCategoryFrom"
        :rules="addCategoryFromRules"
        ref="addCategorygoryFromRef"
        label-width="100px"
      >
        <el-form-item label="父级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCategoryList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCategoryChanged"
            clearable
          />
        </el-form-item>
        <el-form-item label="分类名称：" prop="name">
          <el-input v-model="addCategoryFrom.name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        page: 1,
        size: 8
      },
      activeName: '2c1016872b91dbac3c5b068d799cacee',
      // 商品分类的数据列表，默认为空
      categoryList: [],
      // 总数据条数
      total: 0,
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
      // 控制修改分类对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的分类信息对象
      editForm: {},
      specialLineList: {},
      pageHeight: 0,
      pageSizeList: [5, 8, 10, 20]
    }
  },
  created () {
    this.pageHeight = `${document.documentElement.clientHeight}`
    this.listSpecialLine()
    this.listCategories()
  },
  methods: {
    // 监听 size 改变
    handleSizeChange (newSize) {
      this.queryInfo.size = newSize
      this.listCategories()
    },
    // 监听 page 改变
    handleCurrentChange (newPage) {
      this.queryInfo.page = newPage
      this.listCategories()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCategoryDialog () {
      // 先获取父级分类的数据列表
      this.listParentCategories()
      // 再展示出对话框
      this.addCategoryDialogVisible = true
    },

    // 选择项发生变化触发这个函数
    parentCategoryChanged () {
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

    // 监听对话框的关闭事件，重置表单数据
    addCategorygoryDialogClosed () {
      this.$refs.addCategorygoryFromRef.resetFields()
      this.selectedKeys = []
      this.addCategoryFrom.parentId = 0
    },
    // 切换标签
    shiftTabs () {
      this.queryInfo.specialLineId = this.activeName
      this.listCategories()
    },

    // 后端交互相关

    async listSpecialLine () {
      const { data: res } = await this.$http.get('category/specialLine')
      if (res.status !== 200) {
        return this.$message.error('获取专业线标签失败！')
      }
      this.specialLineList = res.data
    },

    // 监听 switch 开关状态的改变
    async closeAvailable (user) {
      const { data: res } = await this.$http.put(
        `category/${user.id}/available/${user.available}`
      )
      if (res.status !== 200) {
        user.available = !user.available
        return this.$message.error('更新分类有效性失败！')
      }
      this.$message.success('更新分类有效性成功！')
    },

    // 获取商品分类数据
    async listCategories () {
      const { data: res } = await this.$http.get('category/list', {
        params: {
          page: this.queryInfo.page,
          size: this.queryInfo.size,
          specialLineId: this.activeName
        }
      })

      if (res.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      console.log(res.data)
      // 把数据列表，赋值给 categoryList
      this.categoryList = res.data.records
      // 为总数据条数赋值
      this.total = res.data.total
      if (this.total === 0) {
        this.categoryList = undefined
      }
    },
    // 获取父级分类的数据列表
    async listParentCategories () {
      const { data: res } = await this.$http.get('category/menus', {})

      if (res.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      console.log(res.data)
      this.parentCategoryList = res.data
    },

    // 点击按钮，添加新的分类
    addCategory () {
      this.$refs.addCategorygoryFromRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'category/add',
          this.addCategoryFrom
        )

        if (res.status !== 201) {
          return this.$message.error(res.message)
        }

        this.$message.success('添加分类成功！')
        this.listCategories()
        this.addCategoryDialogVisible = false
      })
    },
    // 展示编辑分类的对话框
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('category/' + id)

      if (res.status !== 200) {
        return this.$message.error('查询分类信息失败！')
      }

      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 根据Id删除对应的用户信息
    async removeById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类信息, 是否继续?',
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
      console.log(res)
      if (res.status !== 200) {
        return this.$message.error('删除该分类失败！')
      }

      this.$message.success('删除该分类成功！')
      this.listCategories()
    },

    // 修改分类信息并提交
    editCategoryInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          'category/' + this.editForm.id,
          {
            name: this.editForm.name
          }
        )

        if (res.status !== 200) {
          return this.$message.error(res.message)
        }
        // 提示修改成功
        this.$message.success('更新分类信息成功！')
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.listCategories()
      })
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
