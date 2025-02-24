import { createRouter, createWebHistory } from 'vue-router'

// 预加载组件
const Home = () => import('@/views/Home.vue')
const Search = () => import('@/views/Search.vue')
const RecipeDetail = () => import('@/views/RecipeDetail.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: RecipeDetail
  }
]

// 获取基础路径
const base = import.meta.env.BASE_URL

const router = createRouter({
  history: createWebHistory(base),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 添加路由守卫处理 URL 参数
router.beforeEach((to, from, next) => {
  // 处理来自 404.html 的重定向
  const redirectPath = to.query.p
  if (redirectPath) {
    // 移除 URL 中的 p 参数并重定向到实际路径
    const { p, ...query } = to.query
    next({
      path: redirectPath,
      query
    })
    return
  }
  next()
})

export default router 