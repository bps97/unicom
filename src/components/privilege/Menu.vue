<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>物料管理</el-breadcrumb-item>
      <el-breadcrumb-item>菜单项管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-popover placement="right" title="点击添加『物料菜单项』" trigger="hover" content="注意菜单项命名要有辨识度">
            <el-button type="primary" slot="reference" @click="showNewElementDIalog">添加菜单项</el-button>
          </el-popover>
        </el-col>
      </el-row>

      <!-- 表格 -->

      <el-table
        :data="MenuData"
        row-key="id"
        style="width: 100%;margin-bottom: 20px;"
        border
        height="484"
        stripe
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column prop="name" label="菜单项名称" sortable />
        <el-table-column prop="path" label="菜单项路径" sortable />
        <el-table-column label="菜单项等级" width="100px" align="center">
          <!-- 排序 -->
          <template slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.children!==null">一级</el-tag>
            <el-tag type="warning" size="mini" v-else>二级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效性" width="66px">
          <!-- 是否有效 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.available" @change="closeAvailable(scope.row)" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="50px" align="center">
          <!-- 操作 -->
          <template slot-scope="scope">
            <el-button
              circle
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.id)"
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column label="调整次序" width="100px" align="center">
          <!-- 操作 -->
          <template slot-scope="scope">
            <el-button circle icon="el-icon-caret-top" size="mini" @click="reduceIndex(scope.row)" />
            <el-button
              circle
              icon="el-icon-caret-bottom"
              size="mini"
              @click="plusIndex(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加菜单项的对话框 -->
    <el-dialog
      title="添加菜单项"
      :visible.sync="newElementDialogVisible"
      width="50%"
      @close="newElementDialogClosed"
    >
      <!-- 添加菜单项的表单 -->
      <el-form
        :model="newElementForm"
        :rules="newElementFormRules"
        ref="newElementFormRef"
        label-width="120px"
      >
        <el-form-item label="父级菜单项：" prop="parentId">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-select v-model="newElementForm.parentId" placeholder="不选择则为0级菜单项">
            <el-option
              v-for="item in parentMenuData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单项名称：" prop="name">
          <el-input v-model="newElementForm.name" />
        </el-form-item>
        <el-form-item label="菜单项路径：" prop="path">
          <el-input v-model="newElementForm.path" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newElementDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品菜单项的数据列表，默认为空
      MenuData: [],
      // 控制添加菜单项对话框的显示与隐藏
      newElementDialogVisible: false,
      // 添加菜单项的表单数据对象
      newElementForm: {
        // 将要添加的菜单项的名称
        name: '',
        path: '',
        // 父级菜单项的Id
        parentId: undefined
      },
      // 添加菜单项表单的验证规则对象
      newElementFormRules: {
        name: [{ required: true, message: '请输入菜单项名称', trigger: 'blur' }]
      },
      // 父级菜单项的列表
      parentMenuData: []

    }
  },
  created () {
    this.listAllMenus()
  },
  methods: {
    // 点击按钮，展示添加菜单项的对话框
    showNewElementDIalog () {
      // 先获取父级菜单项的数据列表
      this.listParentMenus()
      // 再展示出对话框
      this.newElementForm.parentId = undefined
      this.newElementDialogVisible = true
    },
    // 监听对话框的关闭事件，重置表单数据
    newElementDialogClosed () {
      this.$refs.newElementFormRef.resetFields()
      this.newElementForm.parentId = 0
    },
    // 监听 switch 开关状态的改变
    async closeAvailable (user) {
      const { data: res } = await this.$http.put(
        `menu/${user.id}/available=${user.available}`
      )
      if (res.status !== 200) {
        user.available = !user.available
        return this.$message.error(res.message)
      }
      this.$message.success('更新菜单项有效性成功！')
    },
    // 获取商品菜单项数据
    async listAllMenus () {
      const { data: res } = await this.$http.get('menu/list/all')

      if (res.status !== 200) {
        return this.$message.error(res.message)
      }
      console.log(res.data)
      // 把数据列表，赋值给 MenuData
      this.MenuData = res.data
    },
    // 获取父级菜单项的数据列表
    async listParentMenus () {
      const { data: res } = await this.$http.get('menu/list/root')

      if (res.status !== 200) {
        return this.$message.error(res.message)
      }

      console.log(res.data)
      this.parentMenuData = res.data
    },

    // 点击按钮，添加新的菜单项
    addCategory () {
      this.$refs.newElementFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'menu/add',
          this.newElementForm
        )

        if (res.status !== 201) {
          return this.$message.error(res.message)
        }

        this.$message.success('添加菜单项成功！')
        this.listAllMenus()
        this.newElementDialogVisible = false
      })
    },
    reduceIndex (menu) {
      this.updateIndex(menu.id, menu.portalIndex - 1)
    },
    plusIndex (menu) {
      this.updateIndex(menu.id, menu.portalIndex + 1)
    },
    async updateIndex (id, index) {
      const { data: res } = await this.$http.put(`menu/${id}/index=${index}`)
      if (res.status !== 200) {
        return this.$message.error(res.message)
      }
      this.$message.success('更新序号成功！')
      this.listAllMenus()
    },

    // 根据Id删除对应的用户信息
    async removeById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该菜单项信息, 是否继续?',
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

      const { data: res } = await this.$http.delete('menu/' + id)
      console.log(res)
      if (res.status !== 200) {
        return this.$message.error(res.message)
      }

      this.$message.success('删除该菜单项成功！')
      this.listAllMenus()
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
