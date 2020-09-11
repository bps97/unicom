<template>
  <div>
    <el-row :gutter="20" style="margin-top:10px;">
      <el-col :span="8">
        <div class="grid-content bg-purple">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>个人中心</span>
            </div>
            <div class="name-role">
              <span class="sender">{{accountInfo.roleName}} - {{accountInfo.name}}</span>
            </div>
            <div class="registe-info">
              <span class="registe-info">
                注册时间：
                <li class="el-icon-alarm-clock"></li>2020/4/10 9:40:33
              </span>
            </div>
            <el-divider></el-divider>
            <div class="personal-relation">
              <div class="relation-item">
                手机号码:
                <div style="float: right; padding-right:20px;">{{accountInfo.mobile}}</div>
              </div>
            </div>
            <div class="personal-relation">
              <div class="relation-item">
                登录账户:
                <div style="float: right; padding-right:20px;">{{accountInfo.username}}</div>
              </div>
            </div>
            <div class="personal-relation">
              <div class="relation-item">
                邮箱账号:
                <div style="float: right; padding-right:20px;">{{accountInfo.email}}</div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="grid-content bg-purple">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>基本资料</span>
            </div>
            <div>
              <el-form
                label-width="80px"
                :model="accountInfo"
                size="small"
                label-position="right"
                :rules="editFormRules"
                ref="editFormRef"
              >
                <el-form-item label="用户昵称" prop="name">
                  <el-input auto-complete="off" v-model="accountInfo.name"></el-input>
                </el-form-item>
                <el-form-item label="手机号码" prop="mobile">
                  <el-input auto-complete="off" v-model="accountInfo.mobile"></el-input>
                </el-form-item>
                <el-form-item label="邮箱账户" prop="email">
                  <el-input maxlength="18" v-model="accountInfo.email"></el-input>
                </el-form-item>
              </el-form>
              <div slot="footer" class="dialog-footer">
                <el-button size="mini" type="primary" @click="editUserInfo">提交</el-button>
                <el-button size="mini" type="warning">关闭</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {

  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return {
      accountInfo: {
        id: '',
        roleName: '默认角色',
        mobile: '',
        name: '',
        username: ''
      },
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCurrentUserInfo()
  },
  methods: {
    // 获取所有的菜单
    async getCurrentUserInfo () {
      const { data: res } = await this.$http.get('/account/info')
      if (res.status !== 200) return this.$message.error(res.message)
      this.accountInfo = res.data
    },
    // 修改用户信息并提交
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('错误')
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          'account/' + this.accountInfo.id,
          {
            name: this.accountInfo.name,
            email: this.accountInfo.email,
            mobile: this.accountInfo.mobile
          }
        )

        if (res.status !== 200) {
          return this.$message.error(res.message)
        }
        // 提示修改成功
        this.$message.success('更新用户信息成功！')
      })
    }
  }
}
</script>

<style lang="less" scoped>
//卡片样式
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.box-card {
  width: 100%;
}
//文本样式区
.name-role {
  font-size: 16px;
  padding: 5px;
  text-align: center;
}
.sender {
  text-align: center;
}
.registe-info {
  text-align: center;
  padding-top: 10px;
}
.personal-relation {
  font-size: 16px;
  padding: 0px 5px 15px;
  margin-right: 1px;
  width: 100%;
}

.relation-item {
  padding: 12px;
}
.dialog-footer {
  padding-top: 10px;
  padding-left: 10%;
}
//布局样式区
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>
