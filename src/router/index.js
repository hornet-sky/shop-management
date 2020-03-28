import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../views/Login.vue'
const Login = () => import(/* webpackChunkName: 'login_home_welcome' */ '../views/Login.vue')
// import Home from '../views/Home.vue'
const Home = () => import(/* webpackChunkName: 'login_home_welcome' */ '../views/Home.vue')
// import Welcome from '../views/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: 'login_home_welcome' */ '../views/Welcome.vue')

// import Users from '../views/users/Users.vue'
const Users = () => import(/* webpackChunkName: 'users_rights_roles' */ '../views/users/Users.vue')
// import Rights from '../views/rights/Rights.vue'
const Rights = () => import(/* webpackChunkName: 'users_rights_roles' */ '../views/rights/Rights.vue')
// import Roles from '../views/rights/Roles.vue'
const Roles = () => import(/* webpackChunkName: 'users_rights_roles' */ '../views/rights/Roles.vue')

// import GoodsCategory from '../views/goods/GoodsCategory.vue'
const GoodsCategory = () => import(/* webpackChunkName: 'goods_category_and_params' */ '../views/goods/GoodsCategory.vue')
// import GoodsParams from '../views/goods/GoodsParams.vue'
const GoodsParams = () => import(/* webpackChunkName: 'goods_category_and_params' */ '../views/goods/GoodsParams.vue')

// import GoodsList from '../views/goods/GoodsList.vue'
const GoodsList = () => import(/* webpackChunkName: 'goods_list_and_add' */ '../views/goods/GoodsList.vue')
// import GoodsAdd from '../views/goods/GoodsAdd.vue'
const GoodsAdd = () => import(/* webpackChunkName: 'goods_list_and_add' */ '../views/goods/GoodsAdd.vue')

// import Orders from '../views/orders/Orders.vue'
const Orders = () => import(/* webpackChunkName: 'orders_reports' */ '../views/orders/Orders.vue')
// import Reports from '../views/reports/Reports.vue'
const Reports = () => import(/* webpackChunkName: 'orders_reports' */ '../views/reports/Reports.vue')

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
