import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Categories from '../components/materials/Category.vue'
import Params from '../components/materials/Params.vue'
import Goods from '../components/materials/List.vue'
import GoodsAdd from '../components/materials/Add.vue'
import Approve from '../components/record/Approve.vue'
import Record from '../components/record/Record.vue'

// 导入Login组件

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Categories },
        { path: '/params', component: Params },
        { path: '/materials', component: Goods },
        { path: '/materials/add', component: GoodsAdd },
        { path: '/approve', component: Approve },
        { path: '/record', component: Record }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 挂载路由导航首尾
  // to 将要访问的路径
  // from  代表从哪个路径跳转而来
  // next 是一个函数 表示放行
  // next()放行 next('/login')强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
