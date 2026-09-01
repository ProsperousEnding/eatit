import { getImageUrl } from '@/utils/image'

const structuredDataId = 'recipe-structured-data'

export const useRecipeMetadata = () => {
  const removeRecipeMetadata = () => {
    document.getElementById(structuredDataId)?.remove()
  }

  const updateRecipeMetadata = (recipe) => {
    const sourceName = recipe.source?.name || recipe.source?.repository || '开源菜谱'
    const description = `${recipe.name}的食材用量、准备事项和烹饪步骤，内容整理自 ${sourceName}。`
    const title = `${recipe.name}做法 - EatIt`
    const imageUrl = new URL(getImageUrl(recipe.image), window.location.origin).href
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageUrl)

    removeRecipeMetadata()
    const duration = Number.parseInt(recipe.cookingTime, 10)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.name,
      image: imageUrl,
      description,
      recipeCategory: recipe.category,
      recipeIngredient: recipe.preparation,
      recipeInstructions: recipe.steps.map(step => ({
        '@type': 'HowToStep',
        text: step
      })),
      ...(Number.isFinite(duration) ? {
        cookTime: `PT${duration}M`,
        ...(!recipe.advanceTime ? { totalTime: `PT${duration}M` } : {})
      } : {}),
      ...(recipe.nutrition ? {
        nutrition: {
          '@type': 'NutritionInformation',
          calories: recipe.nutrition.calories,
          proteinContent: recipe.nutrition.protein,
          fatContent: recipe.nutrition.fat,
          carbohydrateContent: recipe.nutrition.carbs,
          fiberContent: recipe.nutrition.fiber
        }
      } : {})
    }
    const script = document.createElement('script')
    script.id = structuredDataId
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(structuredData)
    document.head.append(script)
  }

  return { removeRecipeMetadata, updateRecipeMetadata }
}
