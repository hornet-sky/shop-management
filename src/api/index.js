import Vue from 'vue'
import axios from 'axios'
import NProgress from 'nprogress'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = sessionStorage.getItem('token')
  return config
}, error => {
  return Promise.reject(error)
})
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
}, error => {
  NProgress.done()
  console.error('error from interceptor', error)
  return Promise.resolve({
    data: {
      data: null,
      meta: {
        status: 500,
        msg: parseError(error)
      }
    }
  })
})
Vue.prototype.$http = axios

function parseError (error) {
  if (!error) {
    return '未知错误'
  }
  if (typeof error === 'string') {
    return error
  }
  if (error instanceof Error) {
    switch (error.message) {
      case 'Network Error':
        return '无法访问到服务器'
      default:
        return error.message
    }
  }
}
