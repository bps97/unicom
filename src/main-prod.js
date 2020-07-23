import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
// 配置请求的根路径
// axios.defaults.baseURL = 'http://bps.cool:8101'
axios.defaults.baseURL = 'http://10.22.34.148:8101'
// axios.defaults.baseURL = 'http://localhost:8101'
axios.interceptors.request.use(config => {
  config.headers.token = window.sessionStorage.getItem('token')
  // 请求拦截器
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
