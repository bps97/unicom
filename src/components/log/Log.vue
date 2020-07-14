<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>日志管理</el-breadcrumb-item>
      <el-breadcrumb-item>日志信息</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->

    <!-- tab 页签区域 -->
    <el-tabs v-model="activeName"
             @tab-click="shiftTabs"
             type="border-card">
      <el-tab-pane v-for='item in repositoryList'
                   :key='item.key'
                   :label='item.value'
                   :name='item.key'>
      </el-tab-pane>
      <el-row>
        <el-col :span="20">
          <el-form ref="logForm"
                   :model="logForm"
                   label-width="80px">
            <!-- 多选框 -->
            <div style="margin-bottom: 20px">
              <el-checkbox-group v-model="logForm.checkedspecialLine"
                                 size="medium">
                <el-checkbox-button v-for="tp in specialLines"
                                    :label="tp"
                                    :key="tp"
                                    border>{{tp}}</el-checkbox-button>

              </el-checkbox-group>

            </div>
          </el-form>
        </el-col>
        <el-col :span="2">
          <el-button type="primary"
                     icon="el-icon-search"
                     @click="searchLog">搜索</el-button>
        </el-col>
      </el-row>
      <el-row>
        <!-- 日志列表区域 -->
        <el-table :data="recordList"
                  border
                  stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="物料名称"
                           prop="materialName"
                           width="400"></el-table-column>
          <el-table-column label="物料数量"
                           prop="count"></el-table-column>
          <el-table-column label="分类类型"
                           prop="categoryName"></el-table-column>
          <el-table-column label="申请用户"
                           sortable
                           prop="userName"></el-table-column>
          <el-table-column label="记录类型"
                           sortable
                           prop="type"></el-table-column>
          <el-table-column label="备注信息"
                           prop="message"></el-table-column>
          <el-table-column label="工单时间"
                           sortable
                           prop="createTime"
                           width="100"></el-table-column>

        </el-table>
      </el-row>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.page"
                     :page-sizes="[3, 5, 10, 15]"
                     :page-size="queryInfo.size"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-tabs>
    <br>
  </div>
</template>

<script>
const logTypes = ['无线', '线路', '网管', '动力', '装维']
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        page: 1,
        size: 10
      },
      // 商品分类的数据列表，默认为空
      total: 0,
      repositoryList: {},
      recordList: undefined,
      specialLines: logTypes,
      activeName: '1270283833125527553',
      logForm: {
        checkedspecialLine: []
      }
    }
  },
  created() {
    this.listRepositories()
    console.log(this.activeName)
  },
  methods: {
    // 切换标签
    shiftTabs() {
      // console.log(this.activeName)
      // this.cateData.forEach(item => console.log(item.id))
      // var temp = this.cateData.filter(item => item.id === this.activeName)[0]
      // this.cateList = temp.children != null ? temp.children : []
      // this.total = this.cateList.length
    },

    // 监听 size 改变
    handleSizeChange(newSize) {
      this.queryInfo.size = newSize
      this.searchLog()
    },
    // 监听 page 改变
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      this.searchLog()
    },
    async listRepositories() {
      const { data: res } = await this.$http.get('repository/names')
      if (res.meta.status !== 200) {
        return this.$message.error('获取仓库列表失败！')
      }
      this.repositoryList = res.data
    },
    async searchLog() {
      // 提交申请单
      const { data: res } = await this.$http.get('record', {
        params: {
          current: this.queryInfo.page,
          size: this.queryInfo.size,
          repositoryId: this.activeName,
          specialLines: this.logForm.checkedspecialLine.toString()
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取记录列表失败！')
      }

      // console.log(res.data)
      this.recordList = res.data.records
      this.total = res.data.total
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
