# 创建Search.vue文件
<template>
  <div class="search">
    <el-input
      v-model="searchKeyword"
      placeholder="输入食材关键词搜索食谱..."
      class="search-input"
      @keyup.enter="handleSearch"
    >
      <template #append>
        <el-button @click="handleSearch">搜索</el-button>
      </template>
    </el-input>

    <div class="search-results" v-if="recipes.length">
      <el-card 
        v-for="recipe in recipes" 
        :key="recipe.id"
        class="recipe-item"
        @click="goToDetail(recipe.id)"
      >
        <div class="recipe-content">
          <el-image 
            :src="recipe.image || '/default-food.jpg'"
            class="recipe-thumb"
          />
          <div class="recipe-info">
            <h3>{{ recipe.name }}</h3>
            <p class="ingredients">
              主料: {{ recipe.ingredients.join(', ') }}
            </p>
          </div>
        </div>
      </el-card>
    </div>

    <el-empty 
      v-else-if="hasSearched"
      description="没有找到相关食谱"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { storeToRefs } from 'pinia'

const router = useRouter()
const recipeStore = useRecipeStore()
const { recipes } = storeToRefs(recipeStore)

const searchKeyword = ref('')
const hasSearched = ref(false)

/**
 * 处理搜索
 */
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) return
  
  await recipeStore.searchRecipes(searchKeyword.value)
  hasSearched.value = true
}

/**
 * 跳转到详情页
 * @param {number} id - 食谱ID
 */
const goToDetail = (id) => {
  router.push(`/recipe/${id}`)
}
</script>

<style scoped>
.search {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-input {
  margin-bottom: 20px;
}

.recipe-item {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.recipe-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.recipe-content {
  display: flex;
  gap: 20px;
}

.recipe-thumb {
  width: 120px;
  height: 120px;
  border-radius: 4px;
}

.recipe-info {
  flex: 1;
}

.ingredients {
  color: #666;
  margin-top: 10px;
}
</style> 