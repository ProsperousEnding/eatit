import { createRouter, createWebHistory } from 'vue-router'


// 预加载组件
const Home = () => import('@/views/Home.vue')
const Search = () => import('@/views/Search.vue')
const RecipeDetail = () => import('@/views/RecipeDetail.vue')
const CategoryList = () => import('@/views/CategoryList.vue')


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
  },
  {
    path: '/category',
    name: 'CategoryList',
    component: CategoryList
  }
]

// 获取基础路径
const base = '/' + (import.meta.env.VITE_BASE_URL || 'eatit/').replace(/^\/+|\/+$/g, '') + '/'

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

  // 检查路由是否存在（考虑动态路由）
  const matchedRoute = routes.some(route => {
    if (route.path === to.matched[0]?.path) {
      return true
    }
    // 处理动态路由，如 /recipe/:id
    if (route.path.includes(':')) {
      const routePattern = new RegExp(
        '^' + route.path.replace(/:[^/]+/g, '[^/]+') + '$'
      )
      return routePattern.test(to.path)
    }
    return route.path === to.path
  })

  if (!matchedRoute) {
    next({ path: '/' })
    return
  }

  next()
})

export default router 