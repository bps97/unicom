<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>仓管系统</span>
      </div>
      <el-menu
        class="el-menu-demo"
        mode="horizontal"
        background-color="#333854"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-submenu index="1">
          <template slot="title">账户</template>
          <el-menu-item index="2-1" @click="logout">退出</el-menu-item>
          <el-menu-item index="2-2" @click="changePwd">修改密码</el-menu-item>
        </el-submenu>
        <!-- <el-menu-item index="2">
          <a href="#"
             target="_blank">关于我们</a>
        </el-menu-item>-->
      </el-menu>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '66px' : '202px'">
        <div class="toggle-button" style="font-size:20px" @click="toggleCollapse">
          <i class="el-icon-s-unfold"></i>
        </div>
        <!-- 侧边栏菜单区域 -->
        <!--unique-opened 展开唯一一项子菜单-->
        <!--:collapse=ture表示折叠-->
        <el-menu
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="this.$router.history.current.path"
        >
          <!-- :default-active="this.$route.history.current.path" -->
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 设置v-for语句并未每个item绑定一个key值，这里用id -->
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      // 自定义图表
      iconsObj: {
        '1270245105376067585': 'iconfont icon-user',
        '1270245436524851202': 'iconfont icon-tijikongjian',
        '1270271513129332737': 'iconfont icon-shangpin',
        '1270248374752120834': 'iconfont icon-users',
        '1270248374739537921': 'iconfont icon-baobiao',
        '1275324486427385857': 'iconfont icon-danju'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  created () {
    this.listMenus()
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async listMenus () {
      const { data: res } = await this.$http.get('/menu/menus')
      if (res.meta.status !== 200) return this.$message.error(res.message)
      this.menulist = res.data
      console.log(res)
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
    changePwd () {
      this.$router.push('/passwords')
    }
  }
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #333854;
  display: flex;
  justify-content: space-between;
  // padding: 0 224px;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;

    span {
      margin-left: 15px;
    }
  }
  .el-menu {
    background-color: #fff;
  }
}

.el-aside {
  background-color: #fff;
  border: 1px #dfe1e6 solid;
  .el-menu {
    border-right: none;
    color: #252b3a;
  }
}

.el-main {
  // 主要内容区
  background-color: #eef0f5;
}

// 间距十像素
.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #fff;
  font-size: 10px;
  line-height: 24px;
  color: #252b3a;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
