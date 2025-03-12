<template>
  <div class="recipe-detail" v-if="currentRecipe">
    <el-card class="main-info">
      <el-image 
        :src="currentRecipe.image || '/default-food.jpg'"
        fit="cover"
        class="recipe-image"
      />
      
      <h1>{{ currentRecipe.name }}</h1>
      
      <div class="nutrition-info" v-if="currentRecipe.nutrition">
        <el-descriptions :column="3" border>
          <el-descriptions-item v-if="currentRecipe.nutrition.calories" label="热量">
            {{ currentRecipe.nutrition.calories }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecipe.nutrition.protein" label="蛋白质">
            {{ currentRecipe.nutrition.protein }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecipe.nutrition.fat" label="脂肪">
            {{ currentRecipe.nutrition.fat }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecipe.nutrition.carbs" label="碳水">
            {{ currentRecipe.nutrition.carbs }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <el-card class="ingredients-section">
      <template #header>
        <h3>食材清单</h3>
      </template> 
      <el-tag 
        v-for="ingredient in currentRecipe.ingredients"
        :key="ingredient"
        class="ingredient-tag"
      >
        <template v-if="ingredient.includes('克') || ingredient.includes('g') || ingredient.includes('ml') || ingredient.includes('个') || ingredient.includes('片')">
          <span class="ingredient-quantity">{{ ingredient.match(/\d+(\.\d+)?[克gml个片]/)[0] }}</span>
          {{ ingredient.replace(/\d+(\.\d+)?[克gml个片]/, '') }}
        </template>
        <template v-else>
          {{ ingredient }}
        </template>
      </el-tag>
    </el-card>

    <el-card class="steps-section">
      <template #header>
        <div class="section-header">
          <h3>烹饪步骤</h3>
          <span class="total-time">
            <el-icon><Clock /></el-icon>
            总耗时：<span class="time-value">{{ currentRecipe.cookingTime }}</span>
          </span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(step, index) in currentRecipe.steps"
          :key="index"
          :type="getTimelineItemType(index)"
          :hollow="index === currentRecipe.steps.length - 1"
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
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <div class="action-buttons">
      <el-button 
        type="primary" 
        size="large" 
        @click="showPairingsDialog"
        class="pairing-btn"
      >
        查看最佳搭配
      </el-button>
    </div>

    <!-- 菜品搭配对话框 -->
    <el-dialog
      v-model="pairingsDialogVisible"
      :title="`${currentRecipe.name}的最佳搭配`"
      width="90%"
      class="pairings-dialog mobile-dialog"
      :fullscreen="true"
    >
      <div class="mobile-pairings-content">
        <!-- 当前菜品信息 -->
        <div class="current-dish-section">
          <div class="current-dish-card">
            <el-image 
              :src="currentRecipe.image || '/default-food.jpg'"
              class="current-dish-image"
            />
            <div class="current-dish-info">
              <h3>{{ currentRecipe.name }}</h3>
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
              <h5>营养均衡</h5>
              <p>合理搭配荤素</p>
            </div>
            <div class="reason-item">
              <el-icon class="reason-icon"><Sugar /></el-icon>
              <h5>口感互补</h5>
              <p>提升饮食体验</p>
            </div>
            <div class="reason-item">
              <el-icon class="reason-icon"><Dish /></el-icon>
              <h5>健康饮食</h5>
              <p>注重荤素比例</p>
            </div>
          </div>
        </div>

        <!-- 推荐菜品列表 -->
        <div class="recommended-dishes-section">
          <div class="section-title">
            <h4>推荐搭配</h4>
          </div>
          <div class="dishes-grid">
            <div 
              v-for="pairing in recommendedPairings" 
              :key="pairing.id"
              class="dish-item"
              @click="goToDetail(pairing.id)"
            >
              <div class="dish-image-wrapper">
                <el-image 
                  :src="pairing.image || '/default-food.jpg'"
                  fit="cover"
                  class="dish-thumb"
                />
              </div>
              <div class="dish-content">
                <h5>{{ pairing.name }}</h5>
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
            </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { storeToRefs } from 'pinia'
import { ArrowDown, Warning, Clock, Food, Sugar, Dish, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const { currentRecipe, recommendedPairings } = storeToRefs(recipeStore)

// 对话框显示状态
const pairingsDialogVisible = ref(false)

// 营养小贴士
const nutritionTips = ref([
  {
    title: '营养搭配小贴士',
    content: '荤素搭配不仅可以让饮食更加美味，还能确保营养均衡。主菜提供优质蛋白质，蔬菜补充维生素和膳食纤维。'
  },
  {
    title: '健康饮食建议',
    content: '建议一餐中荤菜和素菜的比例为3:7，这样既能享受美味，又不会摄入过多油脂。'
  }
])

/**
 * 获取食谱详情
 */
const getRecipeDetail = async (id) => {
  try {
    if (!id) return
    await recipeStore.getRecipeById(parseInt(id))
    await recipeStore.getRecommendedPairings(parseInt(id))
  } catch (error) {
    ElMessage.error(error.message || '获取菜品详情失败')
  }
}

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await getRecipeDetail(newId)
    }
  }
)

/**
 * 显示搭配对话框
 */
const showPairingsDialog = async () => {
  pairingsDialogVisible.value = true
}

/**
 * 跳转到其他食谱详情
 * @param {number} id - 食谱ID
 */
const goToDetail = (id) => {
  router.push({
    path: `/recipe/${id}`
  })
  pairingsDialogVisible.value = false
}

/**
 * 刷新搭配推荐
 */
const refreshPairings = async () => {
  try {
    const id = route.params.id
    if (!id) return
    await recipeStore.getRecommendedPairings(parseInt(id))
  } catch (error) {
    ElMessage.error('获取搭配推荐失败')
  }
}

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await getRecipeDetail(id)
  }
})

// 在组件销毁时清理状态
onUnmounted(() => {
  recipeStore.currentRecipe = null
  recipeStore.recommendedPairings = []
})

// 获取步骤类型
const getTimelineItemType = (index) => {
  return index === 0 ? 'primary' : index === currentRecipe.value.steps.length - 1 ? 'success' : 'normal'
}

// 获取步骤提示
const getStepTips = (step) => {
  // 实现获取步骤提示的逻辑
  return null
}

/**
 * 处理步骤文本中的数值高亮
 * @param {string} text - 步骤文本
 * @returns {string} - 处理后的HTML文本
 */
const highlightStepValues = (text) => {
  // 匹配时间相关数值
  text = text.replace(/(\d+(?:\.\d+)?)\s*(分钟|秒钟|小时|分|秒|h|min|s)/g, '<span class="highlight-time">$1$2</span>')
  
  // 匹配长度相关数值
  text = text.replace(/(\d+(?:\.\d+)?)\s*(厘米|毫米|cm|mm|米|m)/g, '<span class="highlight-length">$1$2</span>')
  
  // 匹配温度相关数值
  text = text.replace(/(\d+)\s*(度|℃|°C|°F)/g, '<span class="highlight-temp">$1$2</span>')
  
  // 匹配重量相关数值
  text = text.replace(/(\d+(?:\.\d+)?)\s*(克|千克|g|kg|公斤|斤|两)/g, '<span class="highlight-weight">$1$2</span>')
  
  // 匹配体积相关数值
  text = text.replace(/(\d+(?:\.\d+)?)\s*(ml|毫升|升|L|l|dl|分升)/g, '<span class="highlight-volume">$1$2</span>')
  
  // 匹配常用计量单位
  text = text.replace(/(\d+(?:\.\d+)?)\s*(茶匙|勺|汤匙|碗|杯|盘|把|撮|勺子|匙|大勺|小勺|cup|tbsp|tsp)/g, '<span class="highlight-measure">$1$2</span>')
  
  // 匹配数量单位
  text = text.replace(/(\d+(?:\.\d+)?)\s*(个|只|块|片|颗|粒|根|条|串|包|瓣|节|头|朵|丝|段|张|捆|把|束)/g, '<span class="highlight-quantity">$1$2</span>')
  
  return text
}
</script>

<style scoped>
.recipe-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
  background: #f8f9fa;
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

.nutrition-info {
  margin: 25px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
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

.section-header h3 {
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
  color: #F56C6C;
  font-weight: 600;
}

.total-time .el-icon {
  font-size: 1.1em;
  margin-right: 2px;
}

.ingredient-tag {
  margin: 8px;
  padding: 8px 16px;
  font-size: 1em;
  border-radius: 20px;
  background: linear-gradient(135deg, #67C23A 0%, #95D475 100%);
  color: #fff;
  border: none;
  transition: all 0.3s ease;
}

.ingredient-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

.ingredient-quantity {
  color: #409EFF;
  font-weight: 600;
  margin-right: 4px;
}

.step-item {
  padding: 0 20px;
}

.step-content {
  background: #f8f9fa;
  padding: 16px 20px;
  border-radius: 12px;
  margin: 10px 0;
  transition: all 0.3s ease;
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

.step-text .time-highlight {
  color: #F56C6C;
  font-weight: 600;
}

.step-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  color: #e6a23c;
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
  transition: all 0.3s ease;
}

.pairing-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.mobile-dialog :deep(.el-dialog) {
  margin: 0 !important;
  border-radius: 0;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}

.mobile-dialog :deep(.el-dialog__header) {
  padding: 16px;
  margin: 0;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
}

.mobile-dialog :deep(.el-dialog__body) {
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

.current-dish-info h3 {
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

.reason-item h5 {
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

.section-title h4 {
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

.dish-content h5 {
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
  .mobile-dialog :deep(.el-dialog) {
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

:deep(.highlight-time) {
  color: #F56C6C;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-length) {
  color: #409EFF;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-temp) {
  color: #E6A23C;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-weight) {
  color: #67C23A;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-volume) {
  color: #909399;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-measure) {
  color: #9C27B0;
  font-weight: 600;
  padding: 0 2px;
}

:deep(.highlight-quantity) {
  color: #2196F3;
  font-weight: 600;
  padding: 0 2px;
}
</style> 