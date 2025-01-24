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
      width="50%"
      class="pairings-dialog"
    >
      <div class="pairings-content">
        <div class="current-dish">
          <div class="dish-card">
            <el-image 
              :src="currentRecipe.image || '/default-food.jpg'"
              class="dish-image"
            />
            <div class="dish-info">
              <h3>{{ currentRecipe.name }}</h3>
              <div class="dish-properties">
                <el-tag size="small" effect="plain" type="danger">{{ currentRecipe.taste }}</el-tag>
                <el-tag size="small" effect="plain" type="warning">{{ currentRecipe.cookingMethod }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="pairing-explanation">
          <el-divider>
            <el-icon class="divider-icon"><ArrowDown /></el-icon>
          </el-divider>
          <div class="explanation-content">
            <h4>搭配推荐理由</h4>
            <div class="reason-cards">
              <div class="reason-card">
                <el-icon class="reason-icon"><Food /></el-icon>
                <h5>营养均衡</h5>
                <p>合理搭配荤素</p>
              </div>
              <div class="reason-card">
                <el-icon class="reason-icon"><Sugar /></el-icon>
                <h5>口感互补</h5>
                <p>提升饮食体验</p>
              </div>
              <div class="reason-card">
                <el-icon class="reason-icon"><Dish /></el-icon>
                <h5>健康饮食</h5>
                <p>注重荤素比例</p>
              </div>
            </div>
          </div>
        </div>

        <div class="pairings-list">
          <h4>推荐搭配</h4>
          <el-row :gutter="16">
            <el-col 
              v-for="pairing in recommendedPairings" 
              :key="pairing.id"
              :span="12"
            >
              <el-card class="pairing-card" @click="goToDetail(pairing.id)">
                <div class="pairing-content">
                  <div class="pairing-image-wrapper">
                    <el-image 
                      :src="pairing.image || '/default-food.jpg'"
                      class="pairing-thumb"
                      fit="cover"
                    />
                  </div>
                  <div class="pairing-info">
                    <h4>{{ pairing.name }}</h4>
                    <div class="pairing-meta">
                      <div class="pairing-tags">
                        <el-tag size="small" effect="plain" type="success">{{ pairing.category }}</el-tag>
                        <el-tag size="small" effect="plain" type="info">{{ pairing.taste }}</el-tag>
                      </div>
                      <span class="cooking-time">
                        <el-icon><Clock /></el-icon>
                        <span class="time-value">{{ pairing.cookingTime }}</span>
                      </span>
                    </div>
                    <p class="reason-text">{{ pairing.pairingReason }}</p>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="pairingsDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="refreshPairings">换一批搭配</el-button>
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

.pairings-content {
  padding: 24px;
}

.dish-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.dish-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.dish-info h3 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1.4em;
  font-weight: 600;
}

.dish-properties {
  display: flex;
  gap: 10px;
}

.dish-properties .el-tag {
  background: linear-gradient(135deg, #F56C6C 0%, #f89898 100%);
  border: none;
  color: #fff;
}

.dish-properties .el-tag + .el-tag {
  background: linear-gradient(135deg, #E6A23C 0%, #f0c78a 100%);
}

.pairing-explanation {
  margin: 30px 0;
  text-align: center;
}

.divider-icon {
  font-size: 24px;
  color: #409EFF;
  background: #fff;
  border-radius: 50%;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.explanation-content {
  max-width: 800px;
  margin: 0 auto;
}

.explanation-content h4 {
  color: #2c3e50;
  font-size: 1.3em;
  margin: 20px 0;
}

.reason-cards {
  gap: 20px;
  margin: 20px 0;
}

.reason-card {
  padding: 16px;
  border-radius: 12px;
}

.reason-icon {
  font-size: 24px;
  margin-bottom: 12px;
}

.reason-card h5 {
  font-size: 1.1em;
  margin: 0 0 8px 0;
}

.reason-card p {
  color: #666;
  font-size: 0.9em;
  line-height: 1.6;
  margin: 0;
}

.pairings-list {
  margin: 24px 0 0 0;
}

.pairings-list h4 {
  font-size: 1.1em;
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-weight: 600;
}

.pairing-card {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
}

.pairing-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pairing-image-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f8f9fa;
}

.pairing-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pairing-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 0;
}

.pairing-info h4 {
  font-size: 0.95em;
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pairing-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.pairing-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pairing-tags .el-tag {
  font-size: 10px !important;
  padding: 0 6px !important;
  height: 18px !important;
  line-height: 18px !important;
}

.cooking-time {
  font-size: 0.75em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 3px;
}

.cooking-time .time-value {
  color: #F56C6C;
  font-weight: 600;
}

.cooking-time .el-icon {
  font-size: 1em;
}

.reason-text {
  font-size: 0.75em;
  color: #666;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.benefit-list {
  list-style: none;
  padding: 0;
  margin: 15px 0 0 0;
}

.benefit-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.85em;
  margin: 6px 0;
}

.benefit-list li .el-icon {
  color: #67C23A;
}

.nutrition-tips {
  margin-top: 40px;
}

.nutrition-tips :deep(.el-alert) {
  margin-bottom: 15px;
  border-radius: 12px;
}

.dialog-footer .el-button {
  padding: 8px 20px;
  font-size: 0.95em;
  min-width: 100px;
}

@media screen and (max-width: 768px) {
  .recipe-detail {
    padding: 0;
    background: #fff;
  }

  .main-info {
    margin-bottom: 16px;
    border-radius: 0;
    box-shadow: none;
  }

  .recipe-image {
    height: 240px;
    border-radius: 0;
    margin-bottom: 16px;
    box-shadow: none;
  }

  .main-info h1 {
    font-size: 1.6em;
    margin: 16px;
    text-align: left;
  }

  .nutrition-info {
    margin: 16px;
    padding: 12px;
    border-radius: 8px;
  }

  .ingredients-section,
  .steps-section {
    margin-top: 16px;
    border-radius: 0;
    box-shadow: none;
  }

  .section-header {
    padding: 12px 16px;
  }

  .section-header h3 {
    font-size: 1.2em;
  }

  .total-time {
    font-size: 0.8em;
    padding: 4px 10px;
  }

  .ingredient-tag {
    margin: 4px;
    padding: 6px 12px;
    font-size: 0.9em;
  }

  .step-item {
    padding: 0 16px;
  }

  .step-content {
    padding: 12px;
    margin: 8px 0;
    border-radius: 8px;
  }

  .step-content:hover {
    transform: none;
  }

  .step-number {
    font-size: 0.85em;
    padding: 3px 10px;
    border-radius: 10px;
  }

  .step-text {
    font-size: 0.95em;
    line-height: 1.5;
    margin: 6px 0;
  }

  .step-tips {
    font-size: 0.8em;
    padding: 6px 10px;
    margin-top: 8px;
  }

  .action-buttons {
    margin: 24px 16px;
  }

  .pairing-btn {
    width: 100%;
    height: 40px;
    font-size: 1em;
    border-radius: 20px;
  }

  :deep(.pairings-dialog .el-dialog) {
    width: 100% !important;
    margin: 0 !important;
    border-radius: 16px 16px 0 0;
    position: fixed;
    bottom: 0;
    max-height: 90vh;
    overflow-y: auto;
  }

  :deep(.pairings-dialog .el-dialog__header) {
    padding: 16px;
    margin: 0;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 1;
  }

  :deep(.pairings-dialog .el-dialog__title) {
    font-size: 1.1em;
    font-weight: 600;
  }

  :deep(.pairings-dialog .el-dialog__body) {
    padding: 0;
  }

  .dish-card {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .dish-image {
    width: 64px;
    height: 64px;
    border-radius: 6px;
  }

  .dish-info h3 {
    font-size: 1em;
    margin: 0 0 8px;
  }

  .reason-cards {
    display: flex;
    gap: 8px;
    margin: 12px 0;
    padding: 0 4px;
  }

  .reason-card {
    flex: 1;
    padding: 12px 8px;
    text-align: center;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .reason-icon {
    font-size: 18px;
    color: #409EFF;
    margin-bottom: 6px;
  }

  .reason-card h5 {
    font-size: 0.85em;
    margin: 0 0 4px;
  }

  .reason-card p {
    font-size: 0.75em;
    color: #666;
    margin: 0;
  }

  .pairings-list {
    margin-top: 20px;
  }

  .pairings-list h4 {
    font-size: 1em;
    margin: 0 0 12px;
    padding: 0 4px;
  }

  .pairing-card {
    margin-bottom: 12px;
    padding: 0;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .pairing-content {
    display: flex;
    flex-direction: column;
  }

  .pairing-image-wrapper {
    width: 100%;
    height: 160px;
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    background: #f8f9fa;
  }

  .pairing-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pairing-info {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pairing-info h4 {
    font-size: 1em;
    color: #2c3e50;
    font-weight: 600;
    margin: 0;
    line-height: 1.4;
  }

  .pairing-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pairing-tags {
    display: flex;
    gap: 6px;
  }

  .pairing-tags .el-tag {
    font-size: 11px !important;
    padding: 0 8px !important;
    height: 22px !important;
    line-height: 22px !important;
  }

  .cooking-time {
    font-size: 0.85em;
    color: #666;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .cooking-time .el-icon {
    font-size: 1.1em;
  }

  .reason-text {
    font-size: 0.85em;
    color: #666;
    margin: 0;
    line-height: 1.5;
  }

  .pairings-list .el-row {
    margin: 0 !important;
  }

  .pairings-list .el-col {
    padding: 0 !important;
    width: 100% !important;
  }
}

:deep(.pairings-dialog .el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  max-width: 800px;
}

:deep(.pairings-dialog .el-dialog__header) {
  margin: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

:deep(.pairings-dialog .el-dialog__title) {
  font-size: 1.2em;
  font-weight: 600;
  color: #2c3e50;
}

.pairings-content {
  padding: 20px;
}

.dish-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
}

.dish-image {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  object-fit: cover;
}

.dish-info h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.2em;
  font-weight: 600;
}

.dish-properties {
  display: flex;
  gap: 8px;
}

.pairing-explanation {
  margin: 24px 0;
  text-align: center;
}

.divider-icon {
  font-size: 20px;
  color: #409EFF;
  background: #fff;
  border-radius: 50%;
  padding: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.explanation-content h4 {
  font-size: 1.1em;
  margin: 16px 0;
  color: #2c3e50;
}

.reason-cards {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 0;
}

.reason-card {
  flex: 1;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.reason-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.reason-icon {
  font-size: 20px;
  color: #409EFF;
  margin-bottom: 8px;
}

.reason-card h5 {
  font-size: 0.95em;
  margin: 0 0 4px 0;
  color: #2c3e50;
}

.reason-card p {
  font-size: 0.85em;
  color: #666;
  margin: 0;
}

.pairings-list {
  margin: 24px 0 0 0;
}

.pairings-list h4 {
  font-size: 1.1em;
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-weight: 600;
}

.pairing-card {
  margin-bottom: 16px;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  background: #fff;
  overflow: hidden;
}

.pairing-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

.pairing-content {
  position: relative;
}

.pairing-image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.pairing-thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
  transition: all 0.6s ease;
}

.pairing-card:hover .pairing-thumb {
  transform: scale(1.05);
}

.pairing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.pairing-card:hover .pairing-overlay {
  opacity: 1;
}

.pairing-overlay .el-button {
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.pairing-card:hover .pairing-overlay .el-button {
  transform: translateY(0);
}

.pairing-info {
  padding: 16px;
}

.pairing-info h4 {
  font-size: 1em;
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pairing-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pairing-tags {
  display: flex;
  gap: 6px;
}

.cooking-time {
  font-size: 0.8em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cooking-time .el-icon {
  font-size: 1em;
}

.pairing-reason {
  padding: 10px;
  border-radius: 6px;
  background: #f8f9fa;
  margin-top: 12px;
}

.reason-text {
  font-size: 0.8em;
  color: #666;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.pairings-dialog .el-dialog__footer) {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.dialog-footer .el-button {
  padding: 6px 16px;
  font-size: 0.9em;
  min-width: 80px;
  border-radius: 4px;
}

@media screen and (max-width: 768px) {
  :deep(.pairings-dialog .el-dialog) {
    width: 92% !important;
    margin: 8px auto !important;
  }

  :deep(.pairings-dialog .el-dialog__header) {
    padding: 12px 16px;
  }

  :deep(.pairings-dialog .el-dialog__title) {
    font-size: 1.1em;
  }

  .pairings-content {
    padding: 16px;
  }

  .dish-card {
    padding: 12px;
    gap: 12px;
  }

  .dish-image {
    width: 90px;
    height: 90px;
  }

  .dish-info h3 {
    font-size: 1.1em;
    margin-bottom: 8px;
  }

  .reason-cards {
    margin: 12px 0;
    gap: 10px;
  }

  .reason-card {
    padding: 10px;
  }

  .reason-card h5 {
    font-size: 0.9em;
  }

  .reason-card p {
    font-size: 0.8em;
  }

  .pairings-list {
    margin-top: 20px;
  }

  .pairings-list h4 {
    font-size: 1em;
    margin: 0 0 12px;
    padding: 0 4px;
  }

  .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  .pairing-card {
    margin-bottom: 12px;
    padding: 0;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .pairing-content {
    display: flex;
    flex-direction: column;
  }

  .pairing-image-wrapper {
    width: 100%;
    height: 160px;
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    background: #f8f9fa;
  }

  .pairing-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pairing-info {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pairing-info h4 {
    font-size: 1em;
    color: #2c3e50;
    font-weight: 600;
    margin: 0;
    line-height: 1.4;
  }

  .pairing-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pairing-tags {
    display: flex;
    gap: 6px;
  }

  .pairing-tags .el-tag {
    font-size: 11px !important;
    padding: 0 8px !important;
    height: 22px !important;
    line-height: 22px !important;
  }

  .cooking-time {
    font-size: 0.85em;
    color: #666;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .cooking-time .el-icon {
    font-size: 1.1em;
  }

  .reason-text {
    font-size: 0.85em;
    color: #666;
    margin: 0;
    line-height: 1.5;
  }

  .pairings-list .el-row {
    margin: 0 !important;
  }

  .pairings-list .el-col {
    padding: 0 !important;
    width: 100% !important;
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