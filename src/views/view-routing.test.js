// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import CategoryList from './CategoryList.vue'
import SearchView from './Search.vue'
import { useRecipeStore } from '@/stores/recipe'

const createTestRouter = () => createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { render: () => null } },
    { path: '/category', component: CategoryList },
    { path: '/search', component: SearchView }
  ]
})

describe('view route state', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders a clear state for an invalid category', async () => {
    const router = createTestRouter()
    await router.push('/category?id=999')
    await router.isReady()

    const wrapper = shallowMount(CategoryList, {
      global: { plugins: [router], renderStubDefaultSlot: true }
    })

    expect(wrapper.get('h1').text()).toBe('分类不存在')
    expect(wrapper.find('.recipes-grid').exists()).toBe(false)
  })

  it('synchronizes a search query into store results', async () => {
    const router = createTestRouter()
    await router.push('/search?keyword=鸡蛋')
    await router.isReady()

    shallowMount(SearchView, {
      global: { plugins: [router], renderStubDefaultSlot: true }
    })
    await flushPromises()

    const store = useRecipeStore()
    await vi.waitFor(() => expect(store.recipes.length).toBeGreaterThan(0))
    expect(store.recipes.map(recipe => recipe.name)).toContain('西葫芦炒鸡蛋')
  })
})
