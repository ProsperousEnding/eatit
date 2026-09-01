export const getRecipeStepGroups = (recipe) => {
  const steps = Array.isArray(recipe?.steps) ? recipe.steps : []
  const preparation = Array.isArray(recipe?.preparation) ? recipe.preparation : []

  return {
    preparationSteps: preparation,
    cookingSteps: steps
  }
}
