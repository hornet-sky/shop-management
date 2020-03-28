import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ZkTable from 'vue-table-with-tree-grid'
import VueLazyload from 'vue-lazyload'
import VueQuillEditor from 'vue-quill-editor'
import imgLoadingUrl from './assets/image/loading.gif'
import './assets/css/global.css'
import './assets/css/iconfont.css'
import './api'
import './filters'

Vue.config.productionTip = false
Vue.component(ZkTable.name, ZkTable)
Vue.use(VueLazyload, {
  preLoad: 1.3,
  loading: imgLoadingUrl,
  attempt: 1
})
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
