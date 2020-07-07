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
      <el-upload ref="upload"
                 class="uploadAssets"
                 drag
                 action=""
                 :http-request="uploadSuccess"
                 :limit="1"
                 accept=".xls,.xlsx"
                 :before-upload="beforeUpload"
                 :show-file-list="showFileList"
                 :on-exceed="handleExceed">
        <i class="el-icon-receiving"></i>
        <div class="el-upload__text">点击或将文件拖拽到这里上传<br />支持扩展名：.xls、.xlsx（仅支持1个文件）</div>
      </el-upload>
      <el-button type="primary"
                 size="mini"
                 @click="uploadFile">导入</el-button>
    </el-card>

  </div>

</template>

<script>
export default {
  data() {
    return {
      fileList: []
    }
  },
  // 钩子函数,页面加载执行
  created: function() {},
  // 钩子函数,页面加载完成后执行
  mounted() {},
  // 函数方法
  methods: {
    // 上传文件之前判断文件类型
    beforeUpload(file) {
      let isText = file.type === 'application/vnd.ms-excel'
      let isTextComputer =
        file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      return isText | isTextComputer
    },

    // 上传文件个数超过定义的数量
    handleExceed(files, fileList) {
      this.$message.warning('当前限制选择 1 个文件，请删除后继续上传')
    },

    uploadSuccess(file) {
      let formData = new FormData()
      formData.append('file', file.file)
      this.filesList = formData

      this.fileName = file.file.name
    },
    // 提交申请单
    uploadFile() {
      this.$http({
        method: 'post',
        url: 'upload',
        headers: { AccessToken: window.sessionStorage.getItem('token') },
        params: {
          contents: this.contents
        },
        data: this.filesList
      })
        .then(res => {
          console.log(res)
          // let data = JSON.parse(aesDecrypt(res.data.content))
          if (res.data.meta.status === 200) {
            // 提示修改成功
            this.$message.success('导入成功！')
          } else if (res.data.meta.status === 201) {
          }
          console.log(res.data)
        })
        .catch(err => {
          this.$message.error(err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
