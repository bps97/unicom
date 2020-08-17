<template>
  <div>
    <el-card>
      <div>
        <p>
          <strong>
            <span>网络部仓库管理制度</span>
          </strong>
        </p>
        <p>
          <span></span>
        </p>
        <p>
          <span>为加强市公司网络部及县分自由仓库的物资管理，保证生产经营需要，不断完善管理机制，实现仓库管理的制度化、规范化、科学化，特制定本制度：</span>
        </p>
        <p>
          <span>一、严格控制公司外部人单独员进出，外部人员进入仓库需有对应专业管理人员陪同。</span>
        </p>
        <p>
          <span>二、原则上各个专业（县分）物品出入库只允许一个管理员管控。其余人员领用、借用设备需由专业管理员进行操作。</span>
        </p>
        <p>
          <span>三、仓库内物品放置需按分类分架存放。存放原则要易放、易领、易管、易查原则，不同的物品不能混淆。要将可利旧、损坏、报废物品分开堆放，并在损坏、报废物品上贴上标签。光模块、尾仟物品需存放在有锁的柜子里，不允许随意放在物品架上。</span>
        </p>
        <p>
          <span>四、各专业管理员不允许领用其它专业物资。如有紧急情况领用物资且无法在系统内操作的，应在物资领用后第一时间在系统内补充领用单。</span>
        </p>
        <p>
          <span>五、入库流程：原则上市公司仓库只允许无线（维护）、动力、客响（大客户）、网管专业相关物品进入仓库，县分仓库由县分管理员自行把控。入库前各专业管理员提前在“仓库管理系统”内按分类登记入库，并在系统内详细填写物品入库分类、数量、状态、来源相关信息。</span>
        </p>
        <p>
          <span>六、出库流程：物品领用时需提前在“仓库管理系统”内出库，物品出库要标明相关数量、去向及用途。</span>
        </p>
        <p>
          <span>七、管理员对本专业实际物资与系统内数量一致负责。网络部不定期对数量进行核实。县分物资由县分仓库管理员负责，市公司通过检查核实县分物资数量。</span>
        </p>
      </div>

      <el-button
        type="text"
        icon="el-icon-download"
        circle
        @click="downloadTemplate('网络部仓库管理制度.doc')"
      >网络部仓库管理制度.doc</el-button>
      <el-button
        type="text"
        icon="el-icon-download"
        circle
        @click="downloadTemplate('丽水联通网络部物资管理办法（20200728）.doc')"
      >丽水联通网络部物资管理办法（20200728）.doc</el-button>
    </el-card>
  </div>
</template>

<script>
export default {
  methods: {
    async downloadTemplate (fileName) {
      this.$http.get('/download/' + fileName, {
        responseType: 'blob'
      }).then((res) => {
        // let prefix = this.mime.getExtension(res.data.type) // 根据类型获取文件后缀
        const prefix = '.doc'
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
    }
  }
}
</script>
