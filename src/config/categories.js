export const RECIPE_CATEGORIES = [
  { id: 2, name: '主食', sourceCategories: ['主食'], icon: 'bowl' },
  { id: 3, name: '素菜', sourceCategories: ['素菜'], icon: 'apple' },
  { id: 4, name: '荤菜', sourceCategories: ['荤菜'], icon: 'chicken' },
  { id: 5, name: '水产', sourceCategories: ['水产'], icon: 'food' },
  { id: 6, name: '汤粥', sourceCategories: ['汤粥'], icon: 'bowl' }
]

export const RECIPE_CATEGORIES_BY_ID = Object.fromEntries(
  RECIPE_CATEGORIES.map(category => [category.id, category])
)
