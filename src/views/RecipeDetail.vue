<template>
  <div class="recipe-detail">
    <div class="recipe-detail-content">
      <template v-if="currentRecipe">
        <el-card class="main-info">
          <ResponsiveDishImage
            :src="currentRecipe.image"
            :alt="currentRecipe.name"
            fit="contain"
            class="recipe-image"
            sizes="(max-width: 640px) calc(100vw - 64px), (max-width: 899px) calc(100vw - 80px), 760px"
            loading="eager"
            fetch-priority="high"
          />

          <div class="recipe-summary-panel">
            <h1>{{ currentRecipe.name }}</h1>
            <div class="recipe-meta" aria-label="菜品信息">
              <el-tag size="small" effect="plain">{{ currentRecipe.category }}</el-tag>
              <el-tag size="small" effect="plain" type="danger">{{ currentRecipe.taste }}</el-tag>
              <el-tag size="small" effect="plain" type="success">{{ currentRecipe.cookingMethod }}</el-tag>
              <el-tag size="small" effect="plain" type="warning">{{ currentRecipe.difficulty }}</el-tag>
              <el-tag v-if="currentRecipe.methodVariant" size="small" effect="plain" type="info">
                {{ currentRecipe.methodVariant }}
              </el-tag>
              <span class="summary-time">
                <el-icon><Clock /></el-icon>
                {{ currentRecipe.cookingTime }}
              </span>
              <span v-if="currentRecipe.advanceTime" class="advance-time">
                另需准备/等待：{{ currentRecipe.advanceTime }}
              </span>
            </div>

            <div class="nutrition-info" v-if="nutritionItems.length">
              <h2>参考营养</h2>
              <el-descriptions :column="1" border>
                <el-descriptions-item
                  v-for="item in nutritionItems"
                  :key="item.key"
                  :label="item.label"
                >
                  {{ item.value }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <div class="recipe-source" v-if="currentRecipe.source">
              <h2>菜谱来源</h2>
              <p class="source-line">
                <a :href="currentRecipe.source.url" target="_blank" rel="noreferrer">
                  {{ currentRecipe.source.name || currentRecipe.source.repository }}
                </a>
                <template v-if="currentRecipe.source.imageSource">
                  · 配图：
                  <a :href="currentRecipe.source.imageSource.url" target="_blank" rel="noreferrer">
                    {{ currentRecipe.source.imageSource.author }}
                  </a>
                  （<a :href="currentRecipe.source.imageSource.licenseUrl" target="_blank" rel="noreferrer">
                    {{ currentRecipe.source.imageSource.license }}
                  </a>）
                </template>
              </p>
            </div>

            <section v-if="currentRecipe.videoTutorials" class="video-tutorials" aria-labelledby="video-tutorial-title">
              <h2 id="video-tutorial-title">视频教学</h2>
              <div class="video-platform-links">
                <a
                  v-for="platform in currentRecipe.videoTutorials.platforms"
                  :key="platform.key"
                  :href="platform.searchUrl"
                  :class="['video-platform-link', `video-platform-${platform.key}`]"
                  target="_blank"
                  rel="noreferrer"
                >
                  <el-icon><VideoPlay /></el-icon>
                  <span>{{ platform.name }}</span>
                </a>
              </div>
            </section>
          </div>
        </el-card>

        <el-card class="ingredients-section preparation-section">
          <template #header>
            <div class="preparation-header">
              <h2>食材准备</h2>
              <span>{{ stepGroups.preparationSteps.length }} 项</span>
            </div>
          </template>
          <div class="ingredient-overview">
            <h3>所需食材</h3>
            <div class="ingredient-tags">
              <el-tag
                v-for="ingredient in currentRecipe.ingredients"
                :key="ingredient"
                class="ingredient-tag"
              >
                {{ ingredient }}
              </el-tag>
            </div>
          </div>
          <div v-if="currentRecipe.tools?.length" class="tool-overview">
            <h3>所需工具</h3>
            <div class="ingredient-tags">
              <el-tag
                v-for="tool in currentRecipe.tools"
                :key="tool"
                class="tool-tag"
                effect="plain"
                type="info"
              >
                {{ tool }}
              </el-tag>
            </div>
          </div>
          <ol class="preparation-list">
            <li
              v-for="(step, index) in stepGroups.preparationSteps"
              :key="`preparation-${index}`"
              class="preparation-item"
            >
              <span class="preparation-number">{{ index + 1 }}</span>
              <div class="preparation-text" v-html="highlightStepValues(step)"></div>
            </li>
          </ol>
        </el-card>

        <el-card class="steps-section">
          <template #header>
            <div class="section-header">
              <h2>烹饪步骤</h2>
              <span class="total-time">
                <el-icon><Clock /></el-icon>
                参考耗时：<span class="time-value">{{ currentRecipe.cookingTime }}</span>
              </span>
            </div>
          </template>
          <ol class="steps-list">
            <li
              v-for="(step, index) in stepGroups.cookingSteps"
              :key="`cooking-${index}`"
              class="step-item"
            >
              <div class="step-content">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-text" v-html="highlightStepValues(step)"></div>
                <div class="step-tips" v-if="getStepTips(step)">
                  <el-icon><Warning /></el-icon>
                  {{ getStepTips(step) }}
                </div>
              </div>
            </li>
          </ol>
        </el-card>

        <div class="action-buttons">
          <el-button
            type="primary"
            size="large"
            @click="showPairingsDialog"
            class="pairing-btn"
          >
            查看搭配推荐
          </el-button>
        </div>

        <!-- 菜品搭配对话框 -->
        <el-dialog
          v-model="pairingsDialogVisible"
          :title="`${currentRecipe.name}的搭配推荐`"
          width="90%"
          class="pairings-dialog mobile-dialog"
          :fullscreen="isMobile"
        >
          <div class="mobile-pairings-content">
            <!-- 当前菜品信息 -->
            <div class="current-dish-section">
              <div class="current-dish-card">
                <ResponsiveDishImage
                  :src="currentRecipe.image"
                  :alt="currentRecipe.name"
                  class="current-dish-image"
                  sizes="80px"
                />
                <div class="current-dish-info">
                  <h2>{{ currentRecipe.name }}</h2>
                  <div class="current-dish-tags">
                    <el-tag size="small" effect="plain" type="danger">{{ currentRecipe.taste }}</el-tag>
                    <el-tag size="small" effect="plain" type="warning">{{ currentRecipe.cookingMethod }}</el-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 搭配理由说明 -->
            <div class="pairing-reason-section">
              <div class="reason-title">
                <el-divider>搭配理由</el-divider>
              </div>
              <div class="reason-grid">
                <div class="reason-item">
                  <el-icon class="reason-icon"><Food /></el-icon>
                  <h3>分类互补</h3>
                  <p>按菜品角色组合</p>
                </div>
                <div class="reason-item">
                  <el-icon class="reason-icon"><Sugar /></el-icon>
                  <h3>做法变化</h3>
                  <p>优先选择不同做法</p>
                </div>
                <div class="reason-item">
                  <el-icon class="reason-icon"><Dish /></el-icon>
                  <h3>口味协调</h3>
                  <p>兼顾口味差异</p>
                </div>
              </div>
            </div>

            <!-- 推荐菜品列表 -->
            <div class="recommended-dishes-section">
              <div class="section-title">
                <h2>推荐搭配</h2>
              </div>
              <div class="dishes-grid">
                <router-link
                  v-for="pairing in recommendedPairings"
                  :key="pairing.id"
                  class="dish-item"
                  :to="`/recipe/${pairing.id}`"
                  @click="pairingsDialogVisible = false"
                >
                  <div class="dish-image-wrapper">
                    <ResponsiveDishImage
                      :src="pairing.image"
                      :alt="pairing.name"
                      fit="contain"
                      class="dish-thumb"
                      sizes="(max-width: 640px) calc(100vw - 56px), (max-width: 899px) 568px, 140px"
                      loading="eager"
                    />
                  </div>
                  <div class="dish-content">
                    <h3>{{ pairing.name }}</h3>
                    <div class="dish-meta">
                      <div class="dish-tags">
                        <el-tag size="small" effect="plain">{{ pairing.category }}</el-tag>
                        <el-tag size="small" effect="plain" type="info">{{ pairing.taste }}</el-tag>
                      </div>
                      <span class="cooking-time">
                        <el-icon><Clock /></el-icon>
                        {{ pairing.cookingTime }}
                      </span>
                    </div>
                    <p class="pairing-desc">{{ pairing.pairingReason }}</p>
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- 底部操作栏 -->
          <template #footer>
            <div class="mobile-dialog-footer">
              <el-button @click="pairingsDialogVisible = false" block>关闭</el-button>
              <el-button type="primary" @click="refreshPairings" block>换一批搭配</el-button>
            </div>
          </template>
        </el-dialog>
      </template>
      <div v-else-if="isLoading" class="detail-loading" role="status" aria-live="polite">
        正在加载菜谱...
      </div>
      <template v-else>
        <el-empty description="未找到菜品信息" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import '@/styles/element-plus-detail.css'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { storeToRefs } from 'pinia'
import { Warning, Clock, Food, Sugar, Dish, VideoPlay } from '@element-plus/icons-vue'
import {
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElDivider,
  ElEmpty,
  ElIcon,
  ElMessage,
  ElTag
} from 'element-plus'
import { getRecipeStepGroups } from '@/utils/recipe'
import { getStepTips, highlightStepValues } from '@/utils/recipe-step'
import { useRecipeMetadata } from '@/composables/useRecipeMetadata'
import ResponsiveDishImage from '@/components/ResponsiveDishImage.vue'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const { currentRecipe, recommendedPairings } = storeToRefs(recipeStore)

// 对话框显示状态
const pairingsDialogVisible = ref(false)
const isMobile = ref(window.innerWidth < 768)
const isLoading = ref(true)
let detailRequestId = 0
const nutritionLabels = {
  calories: '热量',
  protein: '蛋白质',
  fat: '脂肪',
  carbs: '碳水',
  fiber: '膳食纤维',
  vitamins: '维生素'
}

const nutritionItems = computed(() => Object.entries(nutritionLabels).flatMap(([key, label]) => {
  const value = currentRecipe.value?.nutrition?.[key]
  return value ? [{ key, label, value }] : []
}))
const stepGroups = computed(() => getRecipeStepGroups(currentRecipe.value))
const { removeRecipeMetadata, updateRecipeMetadata } = useRecipeMetadata()

/**
 * 获取食谱详情
 */
const getRecipeDetail = async (id) => {
  const requestId = ++detailRequestId
  const recipeId = Number(id)
  isLoading.value = true

  try {
    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      await router.replace({ name: 'NotFound', params: { pathMatch: ['recipe', String(id)] } })
      return
    }

    currentRecipe.value = null
    recommendedPairings.value = []
    const recipe = await recipeStore.getRecipeById(recipeId)
    if (requestId !== detailRequestId) return
    currentRecipe.value = recipe
    updateRecipeMetadata(recipe)
    await recipeStore.getRecommendedPairings(recipeId)
  } catch (error) {
    if (requestId !== detailRequestId) return
    removeRecipeMetadata()
    currentRecipe.value = null
    recommendedPairings.value = []
    if (error.code === 'RECIPE_NOT_FOUND') {
      await router.replace({ name: 'NotFound', params: { pathMatch: ['recipe', String(id)] } })
      return
    }
    ElMessage.error(error.message || '获取菜品详情失败')
  } finally {
    if (requestId === detailRequestId) isLoading.value = false
  }
}

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId) => {
    await getRecipeDetail(newId)
  },
  { immediate: true }
)

/**
 * 显示搭配对话框
 */
const showPairingsDialog = () => {
  pairingsDialogVisible.value = true
}

/**
 * 刷新搭配推荐
 */
const refreshPairings = async () => {
  try {
    const id = Number(route.params.id)
    if (!Number.isInteger(id)) return
    const excludedIds = recommendedPairings.value.map(pairing => pairing.id)
    await recipeStore.getRecommendedPairings(id, excludedIds)
  } catch {
    ElMessage.error('获取搭配推荐失败')
  }
}

const updateViewport = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', updateViewport)
})

// 在组件销毁时清理状态
onUnmounted(() => {
  window.removeEventListener('resize', updateViewport)
  removeRecipeMetadata()
  recipeStore.currentRecipe = null
  recipeStore.recommendedPairings = []
})

</script>

<style scoped>
.recipe-detail {
  width: 100%;
  min-height: 100%;
  background: #f8f9fa;
}

.recipe-detail-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.detail-loading {
  min-height: 50vh;
  display: grid;
  place-items: center;
  color: #606266;
}

.main-info {
  margin-bottom: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  overflow: hidden;
  background: #fff;
}

.recipe-image {
  width: 100%;
  height: 450px;
  border-radius: 12px;
  margin-bottom: 25px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  object-fit: cover;
}

.main-info h1 {
  font-size: 2.4em;
  color: #2c3e50;
  margin: 20px 0;
  text-align: center;
  font-weight: 600;
}

.recipe-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.summary-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 13px;
}

.advance-time {
  flex-basis: 100%;
  color: #7a4f12;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.nutrition-info {
  margin: 25px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.nutrition-info h2 {
  margin: 0 0 12px;
  color: #303133;
  font-size: 1em;
  font-weight: 600;
}

.recipe-source {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #e4e7ed;
  color: #606266;
}

.recipe-source h2 {
  margin: 0 0 8px;
  color: #303133;
  font-size: 1em;
  font-weight: 600;
}

.recipe-source p {
  margin: 0;
  line-height: 1.6;
}

.recipe-source .source-line {
  color: #606266;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.recipe-source a {
  color: #1261a0;
  font-weight: 600;
  text-underline-offset: 3px;
}

.video-tutorials {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.video-tutorials h2 {
  margin: 0 0 10px;
  color: #303133;
  font-size: 1em;
  font-weight: 600;
}

.video-platform-links {
  display: flex;
  gap: 8px;
}

.video-platform-link {
  flex: 1 1 0;
  min-width: 0;
  min-height: 38px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #d9e7f2;
  border-radius: 6px;
  color: #1261a0;
  background: #f7fbff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
}

.video-platform-link:hover,
.video-platform-link:focus-visible {
  border-color: #409eff;
  background: #ecf5ff;
}

.video-platform-link .el-icon {
  flex: 0 0 auto;
  font-size: 16px;
}

.ingredients-section,
.steps-section {
  margin-top: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  background: #fff;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(to right, #f8f9fa, #fff);
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.6em;
  font-weight: 600;
}

.total-time {
  color: #666;
  font-size: 0.9em;
  background: #f0f2f5;
  padding: 4px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.total-time .time-value {
  color: #a63232;
  font-weight: 600;
}

.total-time .el-icon {
  font-size: 1.1em;
  margin-right: 2px;
}

.ingredient-tag {
  padding: 8px 16px;
  font-size: 1em;
  border-radius: 20px;
  background: linear-gradient(135deg, #67C23A 0%, #95D475 100%);
  color: #fff;
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.preparation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.preparation-header h2,
.ingredient-overview h3,
.tool-overview h3 {
  margin: 0;
}

.preparation-header h2 {
  color: #2c3e50;
  font-size: 1.35em;
}

.preparation-header span {
  color: #606266;
  font-size: 13px;
}

.ingredient-overview {
  padding-bottom: 18px;
  border-bottom: 1px solid #ebeef5;
}

.tool-overview {
  padding: 16px 0 18px;
  border-bottom: 1px solid #ebeef5;
}

.ingredient-overview h3,
.tool-overview h3 {
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
  font-weight: 600;
}

.tool-tag {
  max-width: 100%;
  height: auto;
  min-height: 28px;
  white-space: normal;
  line-height: 1.4;
}

.ingredient-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preparation-list {
  margin: 18px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  list-style: none;
}

.preparation-item {
  min-width: 0;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  border: 1px solid #e1f0dc;
  border-radius: 8px;
  background: #f7fbf5;
}

.preparation-number {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #529b2e;
  font-size: 13px;
  font-weight: 600;
}

.preparation-text {
  min-width: 0;
  color: #2c3e50;
  line-height: 1.7;
}

.ingredient-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

.ingredient-quantity {
  color: #fff;
  font-weight: 600;
  margin-right: 4px;
}

.steps-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.step-item {
  padding: 0 20px;
}

.step-content {
  background: #f8f9fa;
  padding: 16px 20px;
  border-radius: 12px;
  margin: 10px 0;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.step-content:hover {
  background: #f0f2f5;
  transform: translateX(4px);
}

.step-number {
  color: #fff;
  font-weight: 600;
  font-size: 0.9em;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
}

.step-text {
  color: #2c3e50;
  font-size: 1.1em;
  line-height: 1.6;
  margin: 8px 0;
}

.step-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  color: #785000;
  font-size: 0.9em;
  padding: 8px 12px;
  background: rgba(230, 162, 60, 0.1);
  border-radius: 8px;
}

.action-buttons {
  margin: 40px 0;
  text-align: center;
}

.pairing-btn {
  width: 240px;
  height: 50px;
  font-size: 1.2em;
  border-radius: 25px;
  background: linear-gradient(135deg, #409EFF, #66b1ff);
  border: none;
  color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.pairing-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

:global(.mobile-dialog.el-dialog) {
  margin: 0 !important;
  border-radius: 0;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}

:global(.mobile-dialog .el-dialog__header) {
  padding: 16px;
  margin: 0;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
}

:global(.mobile-dialog .el-dialog__body) {
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.mobile-pairings-content {
  padding: 16px;
  background: #f8f9fa;
}

/* 当前菜品卡片样式 */
.current-dish-section {
  margin-bottom: 20px;
}

.current-dish-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.current-dish-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.current-dish-info {
  flex: 1;
}

.current-dish-info h2 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
}

.current-dish-tags {
  display: flex;
  gap: 6px;
}

/* 搭配理由部分样式 */
.pairing-reason-section {
  margin: 20px 0;
}

.reason-title {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.reason-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.reason-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.reason-icon {
  font-size: 24px;
  color: #409EFF;
  margin-bottom: 8px;
}

.reason-item h3 {
  margin: 0 0 4px;
  font-size: 14px;
  color: #333;
}

.reason-item p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

/* 推荐菜品列表样式 */
.recommended-dishes-section {
  margin-top: 20px;
}

.section-title {
  margin-bottom: 16px;
}

.section-title h2 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.dishes-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  color: inherit;
  text-decoration: none;
}

.dish-item:focus-visible {
  outline: 3px solid #409eff;
  outline-offset: 3px;
}

.dish-image-wrapper {
  width: 100%;
  height: 160px;
}

.dish-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-content {
  padding: 12px;
}

.dish-content h3 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #333;
}

.dish-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dish-tags {
  display: flex;
  gap: 6px;
}

.dish-tags .el-tag {
  font-size: 10px !important;
  padding: 0 6px;
}

.cooking-time {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pairing-desc {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 底部操作栏样式 */
.mobile-dialog-footer {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-dialog-footer .el-button {
  margin: 0;
}

/* 适配不同屏幕尺寸 */
@media screen and (min-width: 768px) {
  :global(.mobile-dialog.el-dialog) {
    width: 90% !important;
    max-width: 600px;
    margin: 15vh auto !important;
    border-radius: 16px;
  }

  .reason-grid {
    gap: 16px;
  }

  .dishes-grid {
    gap: 16px;
  }

  .mobile-dialog-footer {
    flex-direction: row;
    justify-content: flex-end;
    gap: 12px;
  }

  .mobile-dialog-footer .el-button {
    width: auto;
  }
}

@media screen and (min-width: 900px) {
  .recipe-detail-content {
    padding: 32px 24px 40px;
  }

  .main-info :deep(.el-card__body) {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.75fr);
    column-gap: 28px;
    align-items: stretch;
    padding: 20px;
  }

  .recipe-image {
    height: clamp(340px, 28vw, 400px);
    margin: 0;
    align-self: stretch;
  }

  .recipe-summary-panel {
    min-width: 0;
    align-self: center;
  }

  .main-info h1 {
    margin: 0 0 14px;
    font-size: 2.2em;
    text-align: left;
  }

  .recipe-meta {
    justify-content: flex-start;
    margin-bottom: 22px;
  }

  .advance-time {
    text-align: left;
  }

  .nutrition-info {
    margin: 0;
    padding: 0;
    background: transparent;
  }

  :global(.mobile-dialog.el-dialog) {
    width: min(90%, 980px) !important;
    max-width: 980px;
    max-height: 88vh;
    margin: 6vh auto !important;
    border-radius: 8px;
  }

  .mobile-pairings-content {
    padding: 24px;
  }

  .dishes-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dish-item {
    display: grid;
    grid-template-columns: 140px minmax(0, 1fr);
  }

  .dish-image-wrapper {
    height: 100%;
    min-height: 150px;
  }
}

@media screen and (max-width: 640px) {
  .recipe-detail-content {
    padding: 16px 12px;
  }

  .recipe-image {
    height: 260px;
    margin-bottom: 16px;
  }

  .main-info h1 {
    font-size: 1.8em;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .section-header h2 {
    font-size: 1.3em;
  }

  .step-item {
    padding: 0 4px;
  }

  .step-content {
    padding: 14px;
  }

  .preparation-list {
    grid-template-columns: 1fr;
  }
}

@media screen and (min-width: 641px) and (max-width: 899px) {
  .recipe-image {
    height: 360px;
  }
}

:deep(.highlight-time) {
  color: #a63232;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-length) {
  color: #1261a0;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-temp) {
  color: #785000;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-weight) {
  color: #2f741d;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-volume) {
  color: #555b65;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-measure) {
  color: #7b1a8f;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-quantity) {
  color: #1261a0;
  font-weight: 600;
  padding: 0 2px;
}
</style>
