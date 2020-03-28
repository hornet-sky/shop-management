import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ZkTable from 'vue-table-with-tree-grid'
import VueLazyload from 'vue-lazyload'
import VueQuillEditor from 'vue-quill-editor'
import imgLoadingUrl from './assets/image/loading.gif'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/css/iconfont.css'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
import 'nprogress/nprogress.css'
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
