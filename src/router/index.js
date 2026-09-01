import { createRouter, createWebHistory } from 'vue-router'

// 预加载组件
const Home = () => import('@/views/Home.vue')
const Search = () => import('@/views/Search.vue')
const RecipeDetail = () => import('@/views/RecipeDetail.vue')
const CategoryList = () => import('@/views/CategoryList.vue')
const NotFound = () => import('@/views/NotFound.vue')

const defaultDescription = 'EatIt 提供随机菜品推荐、分类浏览、食材搜索和详细烹饪步骤。'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '今天吃什么 - EatIt', description: defaultDescription }
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: { title: '搜索菜谱 - EatIt', description: '按菜名、食材、口味和难度搜索适合的菜谱。' }
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: RecipeDetail,
    meta: { title: '菜谱详情 - EatIt', description: '查看食材清单、烹饪步骤、营养信息和搭配建议。' }
  },
  {
    path: '/category',
    name: 'CategoryList',
    component: CategoryList,
    meta: { title: '分类菜谱 - EatIt', description: '按主食、素菜、荤菜、水产和汤粥浏览家常菜谱。' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '页面不存在 - EatIt', description: defaultDescription }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 处理 GitHub Pages 404.html 回传的真实路由。
router.beforeEach(to => {
  const redirectPath = to.query.p
  if (!redirectPath) return true

  const finalPath = Array.isArray(redirectPath) ? redirectPath.at(-1) : redirectPath
  const cleanPath = `/${String(finalPath || '').replace(/^\/+/, '')}`
  const query = { ...to.query }
  delete query.p

  return {
    path: cleanPath,
    query,
    hash: to.hash,
    replace: true
  }
})

router.afterEach(to => {
  const title = to.meta.title || '今天吃什么 - EatIt'
  const content = to.meta.description || defaultDescription
  const defaultImage = new URL(`${import.meta.env.BASE_URL}favicon.png`, window.location.origin).href
  document.title = title
  const description = document.querySelector('meta[name="description"]')
  if (description) description.setAttribute('content', content)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', content)
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', defaultImage)
})

export default router
