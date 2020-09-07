<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- <el-input placeholder="请输入内容" v-model="queryInfo.key" clearable @clear="getuserList">
            <el-button slot="append" icon="el-icon-search" @click="getuserList"></el-button>
          </el-input>-->
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddEditDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <br />

      <el-table :data="roleList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="name"></el-table-column>
        <el-table-column label="角色描述" prop="description"></el-table-column>
        <el-table-column label="操作" width="227px" align="center">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配菜单" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setMenu(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加或修改用户的对话框 -->
    <el-dialog
      :title="dialogName"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form :model="addForm" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="addForm.description"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色所绑定菜单"
      :visible.sync="roleMenuDialogVisible"
      width="30%"
      @close="setMenuDialogClosed"
    >
      <!-- <el-checkbox
        :indeterminate="isIndeterminate"
        v-model="checkAll"
        @change="handleCheckAllChange"
      >全选</el-checkbox>-->
      <!-- <div style="margin: 15px 0;"></div> -->
      <el-checkbox-group v-model="parentMenus" v-for="menu in menuList" :key="menu.id">
        <el-checkbox :label="menu" @change="handleCheckAllChange">{{menu.name}}</el-checkbox>
        <el-checkbox-group v-model="checkedMenus" @change="handlecheckedMenusChange">
          <el-checkbox v-for="sub in menu.children" :label="sub.id" :key="sub.id">{{sub.name}}</el-checkbox>
        </el-checkbox-group>
        <div style="margin: 15px 0;"></div>
      </el-checkbox-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleMenuDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRoleMenus">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      roleList: [],
      menuList: [],
      roleMenuDialogVisible: false,
      checkAll: false,
      checkedMenus: [],
      parentMenus: [],
      isIndeterminate: true,
      roleInfo: '',
      addDialogVisible: false,
      addForm: {
        id: '',
        name: '',
        description: ''
      },
      dialogName: ''
    }
  },
  created () {
    // 获取所有的角色
    this.listRoles()
    this.listAllMenu()
  },
  methods: {
    // 展示分配角色的对话框
    async setMenu (roleInfo) {
      this.roleInfo = roleInfo
      this.listMenuItems(roleInfo.id)
      this.roleMenuDialogVisible = true
    },
    // 监听分配角色对话框的关闭事件
    setMenuDialogClosed () {
      this.roleInfo = {}
    },
    async updateRoleMenus () {
      const { data: res } = await this.$http.put(`menu/roleId=${this.roleInfo.id}`, { menuIds: this.checkedMenus })
      if (res.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      this.$message.success('修改成功')
      this.setMenuDialogClosed()
      this.roleMenuDialogVisible = false
    },
    // 监听添加角色对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    showAddEditDialog () {
      this.addDialogVisible = true
      this.dialogName = '添加角色'
      this.addForm.name = ''
      this.addForm.description = ''
      this.addForm.id = undefined
    },
    // 点击按钮，添加新角色
    addRole () {
      this.dialogName = '添加角色'
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加角色的网络请求
        const { data: res } = await this.$http.post('role/add', this.addForm)

        if (res.status !== 201) {
          this.$message.error('添加或修改角色失败！')
        }

        this.$message.success('添加或修改角色成功！')
        // 隐藏添加角色的对话框
        this.addDialogVisible = false
        // 重新获取角色列表数据
        this.listRoles()
        this.$refs.addFormRef.resetFields()
      })
    },
    // 根据Id删除对应的角色信息
    async removeRoleById (id) {
      // 弹框询问角色是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 如果角色确认删除，则返回值为字符串 confirm
      // 如果角色取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('role/' + id)

      if (res.status !== 200) {
        return this.$message.error('删除角色失败！')
      }

      this.$message.success('删除角色成功！')
      this.listRoles()
    },
    // 展示编辑用户的对话框
    async showEditDialog (id) {
      this.dialogName = '编辑角色信息'
      // console.log(id)
      const { data: res } = await this.$http.get('role/' + id)

      if (res.status !== 200) {
        return this.$message.error('查询角色信息失败！')
      }

      this.addForm = res.data
      this.addDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    handleCheckAllChange (val) {
      var temp = this.checkedMenus
      if (val) {
        this.parentMenus.forEach(function (v) {
          temp = temp.concat(v.children.map(e => e.id))
        })
        this.checkedMenus = temp
      }
    },
    handlecheckedMenusChange (value) {
      console.log(value)
      // 这里可以写选择子选项后影响父选项的一些情况
    },

    // 获取角色列表
    async listRoles () {
      const { data: res } = await this.$http.get('role/list')
      if (res.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      this.roleList = res.data
    },
    // 获取角色列表
    async listMenuItems (roleId) {
      const { data: res } = await this.$http.get(`menu/list/roleId=${roleId}`)
      if (res.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      this.checkedMenus = res.data
        .map(p => p.children)
        .map(e => e.map(menu => menu.id))
        .reduce((result, cur) => result.concat(cur))
    },
    // 获取角色列表
    async listAllMenu () {
      const { data: res } = await this.$http.get('menu/list/all')
      if (res.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      this.menuList = res.data
    }

  }
}
</script>
<style lang="less" scoped>
</style>
