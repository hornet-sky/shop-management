import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Welcome from '../views/Welcome.vue'
import Users from '../views/users/Users.vue'
import Rights from '../views/rights/Rights.vue'
import Roles from '../views/rights/Roles.vue'
import GoodsCategory from '../views/goods/GoodsCategory.vue'
import GoodsList from '../views/goods/GoodsList.vue'
import GoodsParams from '../views/goods/GoodsParams.vue'
import GoodsAdd from '../views/goods/GoodsAdd.vue'
import Orders from '../views/orders/Orders.vue'
import Reports from '../views/reports/Reports.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    children: [
      { path: '/home', redirect: '/welcome' },
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: GoodsCategory },
      { path: '/params', component: GoodsParams },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: GoodsAdd },
      { path: '/orders', component: Orders },
      { path: '/reports', component: Reports }
    ]
  },
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
