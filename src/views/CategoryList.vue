<template>
  <div class="category-list">
    <div class="category-header">
      <h1>{{ categoryName }}</h1>
      <p>为您精选{{ categoryName }}菜品</p>
    </div>

    <div class="recipes-grid" v-if="categoryRecipes.length">
      <el-card 
        v-for="recipe in categoryRecipes" 
        :key="recipe.id"
        class="recipe-card"
        @click="viewRecipeDetail(recipe.id)"
      >
        <div class="recipe-image">
          <el-image 
            :src="recipe.image || '/default-food.jpg'"
            fit="cover"
            class="recipe-thumb"
          />
          <div class="recipe-overlay">
            <span class="cooking-time">
              <el-icon><Clock /></el-icon>
              {{ recipe.cookingTime }}
            </span>
          </div>
        </div>
        <div class="recipe-info">
          <h3>{{ recipe.name }}</h3>
          <div class="recipe-tags">
            <el-tag size="small" type="success">{{ recipe.cookingMethod }}</el-tag>
            <el-tag size="small" type="warning">{{ recipe.difficulty }}</el-tag>
          </div>
        </div>
      </el-card>
    </div>

    <el-empty 
      v-else
      description="暂无相关菜品"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { storeToRefs } from 'pinia'
import { Clock } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()

// 获取路由参数
const categoryId = computed(() => parseInt(route.query.id))
const categoryName = computed(() => route.query.name || '全部')

// 分类菜品列表
const categoryRecipes = ref([])

// 获取分类菜品
const getCategoryRecipes = async () => {
  const allDishes = recipeStore.getAllDishesArray()
  
  // 根据分类ID筛选菜品
  switch(categoryId.value) {
    case 1: // 早餐
      categoryRecipes.value = allDishes.filter(dish => dish.category === '早餐')
      break
    case 2: // 午餐
      categoryRecipes.value = allDishes.filter(dish => 
        ['荤菜', '素菜', '主食'].includes(dish.category)
      )
      break
    case 3: // 晚餐
      categoryRecipes.value = allDishes.filter(dish => 
        ['荤菜', '素菜', '主食'].includes(dish.category)
      )
      break
    case 4: // 小食
      categoryRecipes.value = allDishes.filter(dish => dish.category === '小吃')
      break
    case 5: // 汤品
      categoryRecipes.value = allDishes.filter(dish => dish.category === '汤类')
      break
    case 6: // 肉类
      categoryRecipes.value = allDishes.filter(dish => dish.category === '荤菜')
      break
    case 7: // 素食
      categoryRecipes.value = allDishes.filter(dish => dish.category === '素菜')
      break
    case 8: // 饮品
      categoryRecipes.value = allDishes.filter(dish => dish.category === '饮品')
      break
    default:
      categoryRecipes.value = allDishes
  }
}

// 查看菜品详情
const viewRecipeDetail = (id) => {
  router.push(`/recipe/${id}`)
}

// 页面加载时获取数据
onMounted(() => {
  getCategoryRecipes()
})
</script>

<style scoped>
.category-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.category-header {
  text-align: center;
  margin-bottom: 30px;
}

.category-header h1 {
  font-size: 2em;
  color: #303133;
  margin-bottom: 10px;
}

.category-header p {
  color: #909399;
  font-size: 1.1em;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.recipe-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.recipe-card:hover {
  transform: translateY(-5px);
}

.recipe-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.recipe-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  color: white;
}

.cooking-time {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
}

.recipe-info {
  padding: 15px;
}

.recipe-info h3 {
  margin: 0 0 10px;
  font-size: 1.2em;
  color: #303133;
}

.recipe-tags {
  display: flex;
  gap: 8px;
}
</style> 