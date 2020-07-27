<!-- 单文件组件 -->
<!-- 模板区 -->
<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/avatar.png"
             alt="">
      </div>
      <!-- 表单 -->
      <el-form ref="loginFormRef"
               :model="loginForm"
               :rules="loginFormRules"
               label-width="0"
               class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username"
                    prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->

        <el-form-item prop="password">
          <el-input v-model="loginForm.password"
                    prefix-icon="el-icon-lock"
                    type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary"
                     @click="login">登录</el-button>
          <el-button type="info"
                     @click='resetLoginForm'>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<!-- 行为区 -->
<script>
export default {
  data () {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: '',
        password: '123456'
      },
      loginFormRules: {
        //   验证用户名
        username: [
          { required: true, messages: '请输入登录名称', trrigger: 'blur' },
          {
            min: 3,
            max: 15,

            messages: '长度控制在3-15位内',
            trrigger: 'blur'
          }
        ],
        password: [
          { required: true, messages: '请输入登录密码', trrigger: 'blur' },
          {
            min: 6,
            max: 15,
            messages: '   长度控制在6-15位内',
            trrigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // async同步数据表单的数据，如默认值也能同步
        if (!valid) return
        const { data: res } = await this.$http.post(
          // 如果某个方法的返回值是 promise 可使用await来接受和简化
          // promise是一个容器 存储着某个未来才会结束的事件（通常是一个异步操作）的结果。
          'account/login',
          this.loginForm
        )
        if (res.meta.status !== 200) return this.$message.error('登录失败') // success
        this.$message.success('登录成功')
        // token只在会话期间生效 所以保存在sessionStorage
        window.sessionStorage.setItem('token', res.data.value)
        this.$router.push('/home') // 跳转
      })
    }
  }
}
</script>

<!-- 样式区 -->
<!-- 支持less语法格式，样式生效范围为组件/去掉的话全局生效/一般是前者 -->
<style lang="less" scoped>
.login_container {
  background: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 459px;
  height: 300px;
  background-color: #fff;
  border-radius: 3p;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 100px;
    width: 100px;
    border: 1px, solid, #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0, 0, 10px, #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
