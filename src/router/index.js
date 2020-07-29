import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import(/* webpackChunkName: "Base_Page" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "Base_Page" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "Base_Page" */ '../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "Account" */ '../components/user/Users.vue')
const Pwd = () => import(/* webpackChunkName: "Account" */ '../components/user/Password.vue')

const Privilege = () => import(/* webpackChunkName: "Account" */ '../components/privilege/Privilege.vue')
const Role = () => import(/* webpackChunkName: "Account" */ '../components/privilege/Role.vue')

const Categories = () => import(/* webpackChunkName: "Materials" */ '../components/materials/Category.vue')
const Params = () => import(/* webpackChunkName: "Materials" */ '../components/materials/Params.vue')
const Materials = () => import(/* webpackChunkName: "Materials" */ '../components/materials/Material.vue')

const Upload = () => import(/* webpackChunkName: "Records" */ '../components/record/Upload.vue')
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
        { path: '/excel', component: Upload },
        { path: '/records', component: Records },
        { path: '/logs', component: Log },
        { path: '/privileges', component: Privilege },
        { path: '/roles', component: Role },
        { path: '/passwords', component: Pwd }
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
