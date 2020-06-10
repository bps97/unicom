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
                     @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName"
               @tab-click="shiftTabs">
        <el-tab-pane label="消耗型物料"
                     name="consumptive">
        </el-tab-pane>
        <el-tab-pane label="设备"
                     name="equipment">
        </el-tab-pane>
        <!-- 表格 -->
        <tree-table class="treeTable"
                    :data="cateList"
                    :columns="columns"
                    :selection-type="false"
                    :expand-type="false"
                    show-index
                    index-text="#"
                    border
                    :show-row-hover="false">
          <!-- 是否有效 -->
          <template slot="isok"
                    slot-scope="scope">
            <i class="el-icon-success"
               v-if="scope.row.available === true"
               style="color: lightgreen;"></i>
            <i class="el-icon-error"
               v-else
               style="color: red;"></i>
          </template>
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
          <!-- 操作 -->
          <template slot="opt">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini">编辑</el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini">删除</el-button>
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

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类"
               :visible.sync="addCateDialogVisible"
               width="50%"
               @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm"
               :rules="addCateFormRules"
               ref="addCateFormRef"
               label-width="100px">
        <el-form-item label="分类名称："
                      prop="name">
          <el-input v-model="addCateForm.name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader expand-trigger="hover"
                       :options="parentcateList"
                       :props="cascaderProps"
                       v-model="selectedKeys"
                       @change="parentCateChanged"
                       clearable
                       change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
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
        level: 3,
        page: 1,
        size: 5
      },
      activeName: 'consumptive',
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总的数据
      cateData: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'name'
        },
        {
          label: '专业线',
          prop: 'specialLine'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '类别等级',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'order'
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
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        name: '',
        // 父级分类的Id
        parent_id: 0,
        // 分类的等级，默认要添加的是1级分类
        level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
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
    this.getcateList()
  },
  methods: {
    // 切换标签
    shiftTabs() {
      if (this.activeName === 'consumptive') {
        this.cateList = this.cateData[0].children
      } else {
        this.cateList = this.cateData[1].children
      }
      this.total = this.cateList.length
    },

    // 获取商品分类数据
    async getcateList() {
      const { data: res } = await this.$http.get('category', {
        params: this.querInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      console.log(res.data)
      // 把数据列表，赋值给 cateList
      this.cateData = res.data.content
      this.cateList = this.cateData[0].children
      // 为总数据条数赋值
      this.total = this.cateList.length
    },
    // 监听 size 改变
    handleSizeChange(newSize) {
      this.querInfo.size = newSize
      this.getcateList()
    },
    // 监听 page 改变
    handleCurrentChange(newPage) {
      this.querInfo.page = newPage
      this.getcateList()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentcateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentcateList() {
      const { data: res } = await this.$http.get('category/menus', {})

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      console.log(res.data)
      this.parentcateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.parent_id = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        this.addCateForm.level = this.selectedKeys.length
      } else {
        // 父级分类的Id
        this.addCateForm.parent_id = 0
        // 为当前分类的等级赋值
        this.addCateForm.level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getcateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.level = 0
      this.addCateForm.parent_id = 0
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
