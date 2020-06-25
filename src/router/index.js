import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import Users from '../components/user/Users.vue'

// import Categories from '../components/materials/Category.vue'
// import Params from '../components/materials/Params.vue'
// import Materials from '../components/materials/List.vue'
// import Approve from '../components/record/Approve.vue'
// import Records from '../components/record/Record.vue'
// import Log from '../components/log/Log.vue'

const Login = () => import(/* webpackChunkName: "Base_Page" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "Base_Page" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "Base_Page" */ '../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "Users" */ '../components/user/Users.vue')

const Categories = () => import(/* webpackChunkName: "Materials" */ '../components/materials/Category.vue')
const Params = () => import(/* webpackChunkName: "Materials" */ '../components/materials/Params.vue')
const Materials = () => import(/* webpackChunkName: "Materials" */ '../components/materials/List.vue')

const Approve = () => import(/* webpackChunkName: "Records" */ '../components/record/Approve.vue')
const Records = () => import(/* webpackChunkName: "Records" */ '../components/record/Record.vue')
const Log = () => import(/* webpackChunkName: "Records" */ '../components/log/Log.vue')

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
        { path: '/categories', component: Categories },
        { path: '/params', component: Params },
        { path: '/materials', component: Materials },
        { path: '/approve', component: Approve },
        { path: '/records', component: Records },
        { path: '/logs', component: Log }
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
