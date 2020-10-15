<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>物料管理</el-breadcrumb-item>
      <el-breadcrumb-item>物料信息</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <!-- tab 页签区域 -->
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane
        v-for="item in warehouseNames"
        :key="item.key"
        :label="item.value"
        :name="item.key"
      />
      <el-row :gutter="20">
        <el-col :span="4" :offset="20">
          <el-popover placement="right" title="导出『excel』" trigger="hover">
            <el-button type="primary" slot="reference" @click="exportExcel">导出excel</el-button>
          </el-popover>
        </el-col>
      </el-row>
      <br />
      <!-- table表格区域 -->
      <el-table :data="materialList" border stripe :max-height="pageHeight-300">
        <!-- <el-table-column type="index" /> -->
        <el-table-column label="物料ID" align="center" prop="id" />
        <el-table-column label="仓库" align="center" prop="warehouseName" />
        <el-table-column label="专业线" align="center" prop="specialLine" />
        <el-table-column label="分类" align="center" prop="categoryName" />
        <el-table-column label="物料名称" prop="name" />
        <el-table-column label="损坏状态" prop="status" />
        <el-table-column align="center" label="数量">
          <template slot-scope="scope">
            <div>
              <span>{{scope.row.count}}</span>
              {{scope.row.measureWord}}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" />
        <el-table-column label="查看日志" width="75px">
          <template slot-scope="scope">
            <el-button
              type="success"
              icon="el-icon-view"
              size="mini"
              @click="showRecordDialog(scope.row.id)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[100, 200, 300, 400]"
        :page-size="queryInfo.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      />
      <el-dialog title="日志信息" :visible.sync="recordDialogVisible">
        <div class="block">
          <el-timeline :reverse="true">
            <el-timeline-item
              v-for="item in logList"
              :key="item.id"
              :timestamp="item.updateTime"
              placement="top"
            >
              <el-card>
                <h4>{{item.userName}} {{item.message}}</h4>
                <p>{{item.type}} {{item.count}}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-dialog>
    </el-tabs>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        page: 1,
        size: 100
      },
      // 仓库列表
      warehouseNames: [],
      activeName: '1270283833125527553',
      // 商品列表
      materialList: undefined,
      // 总数据条数
      total: 0,
      // 父级分类的列表
      // 指定级联选择器的配置对象

      // 控制添加w物料对话框的显示与隐藏
      addMaterialForm: {
        name: '',
        warehouseId: '',
        categoryId: '',
        status: '正常'
      },
      recordDialogVisible: false,
      // 查询到的分类信息对象
      editForm: {},
      logList: [],
      pageHeight: 0
    }
  },
  created () {
    // 先获取父级分类的数据列表
    this.getParentcateList()
    this.listWarehouseNames()
    this.listMaterials()
    this.pageHeight = `${document.documentElement.clientHeight}`
  },
  methods: {

    async exportExcel () {
      // const { data: res } = await this.$http.get('material/excel')
      // if (res.status !== 200) {
      //   return this.$message.error('导出失败！')
      // }
      this.$http.get('material/excel', { responseType: 'blob' }).then((res) => {
        const prefix = '.xlsx'
        const data = new Blob([res.data])
        const downloadUrl = window.URL.createObjectURL(data)
        const anchor = document.createElement('a')
        anchor.href = downloadUrl
        anchor.download = +new Date() + '.' + prefix
        anchor.click()
        window.URL.revokeObjectURL(data)
      }).catch((e) => {
        console.error(e)
        return false
      })
    },
    async listWarehouseNames () {
      const { data: res } = await this.$http.get('warehouse/names')

      if (res.status !== 200) {
        return this.$message.error('获取仓库列表失败！')
      }
      this.warehouseNames = res.data
    },

    // 监听添加物料对话框的关闭事件
    addMaterialDialogClosed () {
      this.$refs.addMaterialFormRef.resetFields()
    },

    handleSizeChange (newSize) {
      this.queryInfo.size = newSize
      this.listMaterials()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.page = newPage
      this.listMaterials()
    },

    // 后端数据接口👇

    async showRecordDialog (id) {
      console.log(id)
      const { data: res } = await this.$http.get('material/' + id + '/logs')

      if (res.status !== 200) {
        return this.$message.error('获取物料信息失败！')
      }

      this.logList = res.data
      this.recordDialogVisible = true
    },
    // 点击按钮，添加新的物料
    addMaterial () {
      this.$refs.addMaterialFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'material/add',
          this.addMaterialForm
        )

        if (res.status !== 201) {
          return this.$message.error(res.message)
        }
        this.$message.success('新增物料成功！')
        this.listMaterials()
      })
    },

    // 请求获取分类菜单
    async getParentcateList () {
      const { data: res } = await this.$http.get('category/menus', {})

      if (res.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      return res.data
    },

    // 根据分页信息请求对应的物料列表
    async listMaterials () {
      const { data: res } = await this.$http.get('material', {
        params: {
          page: this.queryInfo.page,
          size: this.queryInfo.size,
          warehouseId: this.activeName
        }
      })
      if (res.status !== 200) {
        this.materialList = undefined
        return this.$message.error(res.meta.message)
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
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
</style>
