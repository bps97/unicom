<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>审批管理</el-breadcrumb-item>
      <el-breadcrumb-item>批量导入</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title=""
                type="info"
                center
                :closable="false">
        <el-button type="text"
                   icon="el-icon-download"
                   circle
                   @click="downloadTemplate">点击下载模板</el-button>
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :active="activeIndex - 0"
                finish-status="success"
                align-center>
        <el-step title="文件上传"></el-step>
        <el-step title="上传情况"></el-step>

      </el-steps>
      <el-form ref="excelForm"
               :model="excelForm"
               label-width="80px">
        <el-tabs v-model="activeIndex"
                 :tab-position="'left'"
                 :before-leave="beforeTabLeave">
          <el-tab-pane label="文件上传"
                       name="0">
            <el-row>
              <el-col :span="8"
                      :offset="1">
                <el-upload ref="upload"
                           class="uploadAssets"
                           drag
                           action=""
                           :http-request="uploadSuccess"
                           :limit="1"
                           accept=".xls,.xlsx"
                           :before-upload="beforeUpload"
                           :show-file-list="true"
                           :on-exceed="handleExceed"
                           v-loading="loading">
                  <i class="el-icon-receiving"></i>
                  <div class="el-upload__text">点击或将文件拖拽到这里上传<br />支持扩展名：.xls、.xlsx（仅支持1个文件）</div>

                </el-upload>
              </el-col>
              <el-col :span="4"
                      :offset="2">
                <el-button type="primary"
                           v-loading="loading"
                           @click="uploadFile">导入</el-button>
              </el-col>
            </el-row>

          </el-tab-pane>
          <el-tab-pane label="上传情况"
                       name="1">
            <el-row>
              <el-col :span="17"
                      :offset="1">
                <el-table :data="materialList"
                          height="600px"
                          border
                          style="width: 100%"
                          :cell-class-name="tableRowClassName">
                  <el-table-column prop="materialName"
                                   label="物料全称">
                  </el-table-column>
                  <el-table-column prop="status"
                                   align="center"
                                   width="50px"
                                   label="物料状态">
                  </el-table-column>
                  <el-table-column prop="count"
                                   align="center"
                                   width="100px"
                                   label="物料数量">
                  </el-table-column>
                  <el-table-column prop="repositoryName"
                                   align="center"
                                   width="100px"
                                   label="仓库位置">
                  </el-table-column>
                  <el-table-column prop="categoryName"
                                   align="center"
                                   width="100px"
                                   label="物料分类">
                  </el-table-column>
                  <el-table-column fixed="right"
                                   label="操作"
                                   width="50">
                    <template slot-scope="scope">
                      <el-button @click.native.prevent="deleteRow(scope.$index, materialList)"
                                 type="text"
                                 size="small">
                        移除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
              <el-col :span="5">
                <el-row>
                  <el-col :offset="6">备注信息：</el-col>
                </el-row>
                <br>
                <el-row>
                  <el-form-item>
                    <el-input type="textarea"
                              placeholder="请输入内容(可为空)"
                              :rows="22"
                              v-model="excelForm.message"></el-input>
                  </el-form-item>
                </el-row>
                <el-row>
                  <el-form-item>
                    <el-button type="primary"
                               @click="onSubmit">确认无误</el-button>
                  </el-form-item>
                </el-row>
              </el-col>
            </el-row>
            <el-row>
              <el-col :offset="1">
                <!-- 分页区域 -->
                <el-pagination @size-change="handleSizeChange"
                               @current-change="handleCurrentChange"
                               :current-page="queryInfo.page"
                               :page-sizes="[3, 5, 10, 15]"
                               :page-size="queryInfo.size"
                               layout="total, sizes, prev, pager, next, jumper"
                               :total="total">
                </el-pagination>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      filesList: [],
      loading: false,
      materialList: [],
      activeIndex: '0',
      total: 0,
      queryInfo: {
        size: 10,
        page: 0
      },
      excelForm: {
        message: '',
        type: '批量导入'
      },
      contents: {
        type: '批量导入'
      }
    }
  },

  // 钩子函数,页面加载执行
  created: function () { },
  // 钩子函数,页面加载完成后执行
  mounted () { },
  // 函数方法
  methods: {

    tableRowClassName ({ row, column, rowIndex, columnIndex }) {
      if (column.label === '物料状态') {
        if (row.status === '正常') { return 'success-row' } else { return 'danger-row' }
      }
      return ''
    },
    // 监听 size 改变
    handleSizeChange (newSize) {
      this.queryInfo.size = newSize
      this.listApplyItems()
    },
    // 监听 page 改变
    handleCurrentChange (newPage) {
      this.queryInfo.page = newPage
      this.listApplyItems()
    },
    // 上传文件之前判断文件类型
    beforeUpload (file) {
      const isText = file.type === 'application/vnd.ms-excel'
      const isTextComputer =
        file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

      return isText | isTextComputer
    },

    // 上传文件个数超过定义的数量
    handleExceed (files, fileList) {
      this.$message.warning('当前限制选择 1 个文件，请删除后继续上传')
    },

    uploadSuccess (file) {
      const formData = new FormData()

      formData.append('file', file.file)
      this.filesList = formData

      this.fileName = file.file.name
    },
    async listApplyItems () {
      const { data: res } = await this.$http.get('/applyItem/list', {
        params: {
          current: this.queryInfo.page,
          size: this.queryInfo.size,
          type: this.contents.type
        }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取物料列表失败！')
      }
      this.materialList = res.data.records
      this.total = res.data.total
    },
    async downloadTemplate () {
      this.$http.get('/download/物料批量导入模版(使用时删除示例).xlsx', {
        responseType: 'blob'
      }).then((res) => {
        // let prefix = this.mime.getExtension(res.data.type) // 根据类型获取文件后缀
        let prefix = '.xlsx'
        let data = new Blob([res.data])
        let downloadUrl = window.URL.createObjectURL(data)
        let anchor = document.createElement('a')
        anchor.href = downloadUrl
        anchor.download = +new Date() + '.' + prefix
        anchor.click()
        window.URL.revokeObjectURL(data)

        // // 回传给后端
        // let files = new window.File([new Blob([res.data])], 'my.mp4');
        // let fd = new FormData();
        // fd.append('file', files);
        // fd.append('file', files);
        // axios.post('/uploadRouter', fd).then((data) => {
        //   console.log(data);
        // }).catch((e) => {
        //   console.error(e);
        // });
      }).catch((e) => {
        console.error(e)
        return false
      })
    },
    async onSubmit () {
      const { data: res } = await this.$http.post('apply/message', {
        message: this.excelForm.message,
        type: this.excelForm.type
      })

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.message)
      }
      // this.materialList = res.data.records
      // this.total = res.data.total
      this.activeIndex = '0'
      this.materialList = undefined
      return this.$message.success('同步完成！')
    },
    // 提交申请单
    uploadFile () {
      this.loading = true
      this.$http({
        method: 'post',
        url: 'applyItem/upload',
        headers: { AccessToken: window.sessionStorage.getItem('token') },
        data: this.filesList,
        params: this.contents
      })
        .then(res => {
          console.log(res)
          // let data = JSON.parse(aesDecrypt(res.data.content))
          if (res.data.meta.status === 200) {
            // 提示修改成功
            this.$message.success('导入成功！')
          } else if (res.data.meta.status === 500) {
            this.$message.error(res.data.meta.message)
          }
          console.log(res.data)
          this.materialList = res.data.data.records
          this.total = res.data.data.total
          this.loading = false
          this.$refs.upload.clearFiles()
          this.filesList = []
          this.activeIndex = '1'
        })
        .catch(err => {
          console.log(err)
          this.$message.error(err)
          // this.$message.error('导入失败！')
          this.loading = false
        })
    },
    async removeItem (id) {
      const { data: res } = await this.$http.delete('applyItem/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
    },
    deleteRow (index, rows) {
      this.removeItem(rows[index].id)
      rows.splice(index, 1)
    },
    // 检测页签变化
    beforeTabLeave (activeName, oldActiveName) {
      if (activeName === '1') {
        if (this.materialList.length === 0) {
          this.listApplyItems()
        }
      }
      return true
    }
  }
}
</script>

<style lang="less">
.el-table .danger-row {
  background: #fde2e2;
}

.el-table .success-row {
  background: #e1f3d8;
}
</style>
