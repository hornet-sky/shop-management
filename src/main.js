import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ZkTable from 'vue-table-with-tree-grid'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/css/iconfont.css'
import './api'

Vue.config.productionTip = false
Vue.component(ZkTable.name, ZkTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
