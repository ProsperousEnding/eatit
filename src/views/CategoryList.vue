<template>
  <div class="category-list">
    <div class="category-header">
      <h1>{{ categoryName }}</h1>
      <p v-if="activeCategory">为您精选{{ categoryName }}菜品</p>
    </div>

    <div class="recipes-grid" v-if="activeCategory && categoryRecipes.length">
      <router-link
        v-for="recipe in categoryRecipes"
        :key="recipe.id"
        class="recipe-card-link"
        :to="`/recipe/${recipe.id}`"
      >
        <el-card class="recipe-card">
          <div class="recipe-image">
          <ResponsiveDishImage
            :src="recipe.image"
            :alt="recipe.name"
            fit="contain"
            class="recipe-thumb"
            sizes="(max-width: 640px) calc(100vw - 40px), 360px"
          />
          <div class="recipe-overlay">
            <span class="cooking-time">
              <el-icon><Clock /></el-icon>
              {{ recipe.cookingTime }}
            </span>
          </div>
          </div>
          <div class="recipe-info">
          <h2>{{ recipe.name }}</h2>
          <div class="recipe-tags">
            <el-tag size="small" type="success">{{ recipe.cookingMethod }}</el-tag>
            <el-tag size="small" type="warning">{{ recipe.difficulty }}</el-tag>
          </div>
          </div>
        </el-card>
      </router-link>
    </div>

    <el-empty
      v-else
      :description="activeCategory ? '暂无相关菜品' : '分类不存在'"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import '@/styles/element-plus-category.css'
import { useRoute } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { Clock } from '@element-plus/icons-vue'
import ResponsiveDishImage from '@/components/ResponsiveDishImage.vue'
import { ElCard, ElEmpty, ElIcon, ElTag } from 'element-plus'
import { RECIPE_CATEGORIES_BY_ID } from '@/config/categories'

const route = useRoute()
const recipeStore = useRecipeStore()

const categoryId = computed(() => Number(route.query.id))
const activeCategory = computed(() => RECIPE_CATEGORIES_BY_ID[categoryId.value])
const categoryName = computed(() => activeCategory.value?.name || '分类不存在')

const categoryRecipes = computed(() => {
  const allDishes = recipeStore.getAllDishesArray()

  if (!activeCategory.value) return []
  return allDishes.filter(dish => activeCategory.value.sourceCategories.includes(dish.category))
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
  color: #595959;
  font-size: 1.1em;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.recipe-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.recipe-card-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.recipe-card:hover {
  transform: translateY(-5px);
}

.recipe-card-link:focus-visible {
  outline: 3px solid #409eff;
  outline-offset: 3px;
}

.recipe-card :deep(.el-card__body) {
  padding: 0;
}

.recipe-image {
  position: relative;
  aspect-ratio: 4 / 3;
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

.recipe-info h2 {
  margin: 0 0 10px;
  font-size: 1.2em;
  color: #303133;
}

.recipe-tags {
  display: flex;
  gap: 8px;
}

@media screen and (max-width: 640px) {
  .category-list {
    padding: 16px 12px;
  }

  .category-header {
    margin-bottom: 16px;
  }

  .recipes-grid {
    gap: 16px;
    padding-top: 8px;
  }
}
</style>
