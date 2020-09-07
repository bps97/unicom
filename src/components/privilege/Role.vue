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
      <el-table :data="roleList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="name"></el-table-column>
        <el-table-column label="角色描述" prop="description"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表
      roleList: []
    }
  },
  created () {
    // 获取所有的角色
    this.listRoles()
  },
  methods: {
    // 获取角色列表
    async listRoles () {
      const { data: res } = await this.$http.get('role/list')
      if (res.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      this.roleList = res.data
    }
  }
}
</script>
<style lang="less" scoped>
</style>
