import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { replaceDirectoryAtomically } from './lib/atomic-directory.mjs'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const sourceDataPath = path.join(projectRoot, 'src/data/dishes.json')
const clientDataDirectory = path.join(projectRoot, 'src/data/client')

const collectDishes = (data) => Object.entries(data).flatMap(([key, value]) => {
  if (key === 'DISH_CHARACTERISTICS') return []
  if (Array.isArray(value)) return value
  return Object.values(value).flatMap(items => Array.isArray(items) ? items : [])
})

const getClientSource = (source) => source ? {
  name: source.name,
  repository: source.repository,
  url: source.url,
  ...(source.imageSource ? {
    imageSource: {
      author: source.imageSource.author,
      license: source.imageSource.license,
      licenseUrl: source.imageSource.licenseUrl,
      url: source.imageSource.url
    }
  } : {})
} : null

const getClientVideoTutorials = (videoTutorials) => videoTutorials ? {
  platforms: videoTutorials.platforms.map(({ key, name, searchUrl }) => ({ key, name, searchUrl }))
} : null

export const createClientRecipeData = (sourceData) => {
  const dishes = collectDishes(sourceData)
  const recipes = dishes.map(dish => ({
    id: dish.id,
    name: dish.name,
    image: dish.image,
    category: dish.category,
    taste: dish.taste,
    cookingMethod: dish.cookingMethod,
    difficulty: dish.difficulty,
    cookingTime: dish.cookingTime,
    ingredients: dish.ingredients
  }))
  const search = Object.fromEntries(dishes.map(dish => [dish.id, dish.steps.join(' ')]))

  const details = Object.fromEntries(dishes.map(dish => [dish.id, {
    id: dish.id,
    name: dish.name,
    image: dish.image,
    category: dish.category,
    taste: dish.taste,
    cookingMethod: dish.cookingMethod,
    difficulty: dish.difficulty,
    cookingTime: dish.cookingTime,
    servings: dish.servings,
    ingredients: dish.ingredients,
    ...(dish.tools ? { tools: dish.tools } : {}),
    preparation: dish.preparation,
    steps: dish.steps,
    ...(dish.methodVariant ? { methodVariant: dish.methodVariant } : {}),
    ...(dish.advanceTime ? { advanceTime: dish.advanceTime } : {}),
    nutrition: dish.nutrition,
    videoTutorials: getClientVideoTutorials(dish.videoTutorials),
    source: getClientSource(dish.source)
  }]))

  return {
    index: {
      DISH_CHARACTERISTICS: sourceData.DISH_CHARACTERISTICS,
      RECIPES: recipes
    },
    search,
    details
  }
}

const serialize = value => `${JSON.stringify(value)}\n`

export const writeClientRecipeData = async (sourceData) => {
  const { index, search, details } = createClientRecipeData(sourceData)
  const stagingDirectory = await mkdtemp(path.join(path.dirname(clientDataDirectory), '.client-data-next-'))
  try {
    await writeFile(path.join(stagingDirectory, 'recipe-index.json'), serialize(index))
    await writeFile(path.join(stagingDirectory, 'recipe-search.json'), serialize(search))

    const recipeDirectory = path.join(stagingDirectory, 'recipes')
    await mkdir(recipeDirectory)
    await Promise.all(Object.entries(details).map(([id, detail]) =>
      writeFile(path.join(recipeDirectory, `${id}.json`), serialize(detail))
    ))

    await replaceDirectoryAtomically(clientDataDirectory, stagingDirectory)
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true })
  }
}

export const checkClientRecipeData = async (sourceData) => {
  const { index, search, details } = createClientRecipeData(sourceData)
  const actualIndex = await readFile(path.join(clientDataDirectory, 'recipe-index.json'), 'utf8')
  if (actualIndex !== serialize(index)) throw new Error('菜谱列表索引已过期，请运行 pnpm run recipes:client')
  const actualSearch = await readFile(path.join(clientDataDirectory, 'recipe-search.json'), 'utf8')
  if (actualSearch !== serialize(search)) throw new Error('菜谱搜索索引已过期，请运行 pnpm run recipes:client')

  const recipeDirectory = path.join(clientDataDirectory, 'recipes')
  const actualFiles = (await readdir(recipeDirectory)).sort()
  const expectedFiles = Object.keys(details).map(id => `${id}.json`).sort()
  if (actualFiles.length !== expectedFiles.length || actualFiles.some((file, index) => file !== expectedFiles[index])) {
    throw new Error('菜谱详情文件集合已过期，请运行 pnpm run recipes:client')
  }

  await Promise.all(Object.entries(details).map(async ([id, detail]) => {
    const actual = await readFile(path.join(recipeDirectory, `${id}.json`), 'utf8')
    if (actual !== serialize(detail)) throw new Error(`菜谱详情已过期: ${id}`)
  }))
}

const isExecutedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isExecutedDirectly) {
  await access(sourceDataPath)
  const sourceData = JSON.parse(await readFile(sourceDataPath, 'utf8'))
  if (process.argv.includes('--check')) {
    await checkClientRecipeData(sourceData)
    console.log(`菜谱客户端数据校验通过：${Object.keys(createClientRecipeData(sourceData).details).length} 道菜。`)
  } else {
    await writeClientRecipeData(sourceData)
    console.log(`已生成 ${Object.keys(createClientRecipeData(sourceData).details).length} 道菜的客户端数据。`)
  }
}
