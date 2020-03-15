import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/login', component: Login },
  { path: '/home', component: Home },
  { path: '/', redirect: '/login' }
]

const router = new VueRouter({
  routes
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path !== '/login' && !sessionStorage.getItem('token')) {
    return next('/login')
  }
  next()
})

export default router
