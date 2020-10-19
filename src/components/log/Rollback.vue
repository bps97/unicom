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
    <el-tabs v-model="activeName" @tab-click="shiftTabs" type="border-card">
      <el-tab-pane
        v-for="item in warehouseNames"
        :key="item.key"
        :label="item.value"
        :name="item.key"
      />
      <el-row>
        <!-- 日志列表区域 -->
        <el-table
          :data="recordList"
          :border="false"
          :max-height="pageHeight-300"
        >
          <el-table-column label="记录类型" sortable width="100" prop="type" />
          <el-table-column label="申请用户" sortable width="100" prop="userName" />
          <el-table-column label="出入库情况" prop="message" />
          <el-table-column label="工单时间" sortable align="center" prop="createTime"/>
<!--          <el-table-column label="是否有效" width="66px">-->
<!--            &lt;!&ndash; 是否有效 &ndash;&gt;-->
<!--            <template slot-scope="scope">-->
<!--              <el-switch v-model="scope.row.available" @change="closeAvailable(scope.row)" disabled/>-->
<!--            </template>-->
<!--          </el-table-column>-->
          <el-table-column label="操作" width="200px" align="center">
            <!-- 操作 -->
            <template slot-scope="scope">
              <el-button
                type="warning"
                size="mini"
                @click="rollbackRecord(scope.row.id)"
                v-if="scope.row.available"
              >回滚</el-button>
              <el-button v-else
                         type="info"
                         size="mini"
                         disabled
              >无效</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-tabs>
    <br />
  </div>
</template>

<script>

export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        page: 1,
        size: 10
      },
      // 商品分类的数据列表，默认为空
      total: 0,
      warehouseNames: {},
      recordList: undefined,
      activeName: '1270283833125527553',
      logForm: {
        checkedSpecialLine: ['大客户', '数据', '传输', '装维', '接入', '无线']
      },
      pageHeight: 0,
      pageSizeList: [5, 8, 10, 20]
    }
  },
  created () {
    this.pageHeight = `${document.documentElement.clientHeight}`
    this.listWarehouseNames()
    this.searchLog()
  },
  methods: {

    async rollbackRecord (id) {
      const { data: res } = await this.$http.get(`record/${id}/rollback`)
      if (res.status !== 200) {
        this.recordList = undefined
        return this.$message.error(res.message)
      }
      this.$message.success(res.message)
    },
    // 切换标签
    shiftTabs () {
    },

    // 监听 size 改变
    handleSizeChange (newSize) {
      this.queryInfo.size = newSize
      this.searchLog()
    },
    // 监听 page 改变
    handleCurrentChange (newPage) {
      this.queryInfo.page = newPage
      this.searchLog()
    },
    async listWarehouseNames () {
      const { data: res } = await this.$http.get('warehouse/names')

      if (res.status !== 200) {
        return this.$message.error('获取仓库列表失败！')
      }
      this.warehouseNames = res.data
    },
    async searchLog () {
      const { data: res } = await this.$http.get('record/page', {
        params: {
          page: this.queryInfo.page,
          size: this.queryInfo.size,
          warehouseId: this.activeName
        }
      })

      if (res.status !== 200) {
        this.recordList = undefined
        return this.$message.error(res.message)
      }

      this.recordList = res.data.records
      this.total = res.data.total
    }
  }
}
</script>

<style lang="less" >
  .treeTable {
    margin-top: 15px;
  }
</style>
