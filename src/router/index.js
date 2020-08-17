import Vue from 'vue'
import VueRouter from 'vue-router'

const Home = () => import(/* webpackChunkName: "Base" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "Base" */ '../components/Welcome.vue')

const Login = () => import(/* webpackChunkName: "Account" */ '../components/Login.vue')
const Users = () => import(/* webpackChunkName: "Account" */ '../components/user/Users.vue')
const Pwd = () => import(/* webpackChunkName: "Account" */ '../components/user/Password.vue')

const Privilege = () => import(/* webpackChunkName: "Privilege" */ '../components/privilege/Privilege.vue')
const Role = () => import(/* webpackChunkName: "Privilege" */ '../components/privilege/Role.vue')

const Categories = () => import(/* webpackChunkName: "Materials" */ '../components/materials/Category.vue')
const Params = () => import(/* webpackChunkName: "Materials" */ '../components/materials/Params.vue')
const Materials = () => import(/* webpackChunkName: "Materials" */ '../components/materials/Material.vue')

const Upload = () => import(/* webpackChunkName: "Records" */ '../components/record/Upload.vue')
const Exist = () => import(/* webpackChunkName: "Records" */ '../components/record/Exist.vue')
const Entry = () => import(/* webpackChunkName: "Records" */ '../components/record/Entry.vue')
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
        { path: '/exist', component: Exist },
        { path: '/entry', component: Entry },
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
