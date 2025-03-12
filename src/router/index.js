import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue')
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: () => import('@/views/RecipeDetail.vue')
  },
  {
    path: '/category',
    name: 'CategoryList',
    component: () => import('@/views/CategoryList.vue')
  }
]

// 获取基础路径
const base = import.meta.env.VITE_BASE_URL || '/eatit/'

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

// 添加路由守卫处理 URL 参数和 404 重定向
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

  // 处理 404
  if (!routes.some(route => route.path === to.path)) {
    next({ path: '/' })
    return
  }

  next()
})

export default router 