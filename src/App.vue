<template>
  <div class="layout-container">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <header v-if="!isHome" class="app-navigation">
      <div class="navigation-inner">
        <router-link class="brand-link" to="/" aria-label="返回 EatIt 首页">
          EatIt
        </router-link>
        <nav class="navigation-actions" aria-label="主要导航">
          <button class="icon-button" type="button" title="返回上一页" aria-label="返回上一页" @click="goBack">
            <ArrowLeft aria-hidden="true" />
          </button>
          <button
            v-if="route.name !== 'Search'"
            class="icon-button"
            type="button"
            title="搜索菜谱"
            aria-label="搜索菜谱"
            @click="router.push('/search')"
          >
            <Search aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>

    <main id="main-content" class="app-main" tabindex="-1">
      <router-view></router-view>
    </main>

    <footer class="app-footer">
      <p>© {{ currentYear }} EatIt - 今天吃什么</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Search } from '@element-plus/icons-vue'

const currentYear = new Date().getFullYear()
const route = useRoute()
const router = useRouter()
const isHome = computed(() => route.name === 'Home')

const goBack = () => {
  if (window.history.state?.back) {
    router.back()
    return
  }

  router.push('/')
}
</script>

<style>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.skip-link {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 1000;
  padding: 8px 12px;
  border-radius: 4px;
  color: #fff;
  background: #1769aa;
  text-decoration: none;
  transform: translateY(-150%);
}

.skip-link:focus {
  transform: translateY(0);
}

.app-main {
  flex: 1;
  padding: 0;
  overflow: visible;
}

.app-navigation {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #e5e7eb;
  backdrop-filter: blur(8px);
}

.navigation-inner {
  width: min(100%, 1200px);
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.brand-link {
  color: #1f2937;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
}

.navigation-actions {
  display: flex;
  gap: 8px;
}

.icon-button {
  width: 36px;
  height: 36px;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 50%;
  color: #303133;
  background: #fff;
  cursor: pointer;
}

.icon-button:hover {
  color: #1769aa;
  border-color: #1769aa;
}

.icon-button:focus-visible {
  outline: 3px solid #1769aa;
  outline-offset: 2px;
}

.icon-button svg {
  width: 100%;
  height: 100%;
}

.app-footer {
  min-height: 60px;
  padding: 0 20px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #666;
  background: #fff;
  border-top: 1px solid #eee;
  box-sizing: border-box;
}

.app-footer p {
  margin: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
