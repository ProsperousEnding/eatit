import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const dataPath = path.join(projectRoot, 'src/data/dishes.json')
const publicRoot = path.join(projectRoot, 'public')
const outputDirectory = path.join(publicRoot, 'images/dishes/responsive')
const manifestPath = path.join(projectRoot, 'src/data/image-variants.json')
const inventoryPath = path.join(projectRoot, 'IMAGE_INVENTORY.md')
const targetWidths = [360, 720, 1024]
const checkOnly = process.argv.includes('--check')

const dishesData = JSON.parse(await readFile(dataPath, 'utf8'))

const collectDishes = (value, dishes = []) => {
  if (Array.isArray(value)) {
    dishes.push(...value)
    return dishes
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach(nested => collectDishes(nested, dishes))
  }

  return dishes
}

const dishes = collectDishes(
  Object.fromEntries(Object.entries(dishesData).filter(([key]) => key !== 'DISH_CHARACTERISTICS'))
)

if (dishes.some(dish => !dish || typeof dish !== 'object' || !Number.isInteger(dish.id) ||
    typeof dish.image !== 'string' ||
    !/^\/images\/dishes\/[a-z0-9-]+\.jpg$/.test(dish.image))) {
  throw new Error('dishes.json 中存在无效的菜品 ID 或图片路径')
}

if (new Set(dishes.map(dish => dish.id)).size !== dishes.length ||
    new Set(dishes.map(dish => dish.image)).size !== dishes.length) {
  throw new Error('dishes.json 中存在重复的菜品 ID 或图片路径')
}

const imagePaths = [...new Set(dishes.map(dish => dish.image))].sort()

const getTargetWidths = (sourceWidth) => [...new Set([
  ...targetWidths.filter(width => width < sourceWidth),
  Math.min(sourceWidth, targetWidths.at(-1))
])].sort((a, b) => a - b)

const setsMatch = (first, second) => (
  first.size === second.size && [...first].every(value => second.has(value))
)

const validateImageOutputs = async () => {
  const existingManifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const expectedOriginalFiles = new Set(imagePaths.map(imagePath => path.basename(imagePath)))
  const actualOriginalFiles = new Set(
    (await readdir(path.dirname(outputDirectory))).filter(file => file.endsWith('.jpg'))
  )

  if (!setsMatch(expectedOriginalFiles, actualOriginalFiles)) {
    throw new Error('源图片目录与 dishes.json 不一致，请运行 pnpm run images:optimize')
  }

  const manifestImagePaths = new Set(Object.keys(existingManifest))
  if (!setsMatch(new Set(imagePaths), manifestImagePaths)) {
    throw new Error('响应式图片清单与 dishes.json 不一致，请运行 pnpm run images:optimize')
  }

  const expectedVariantFiles = new Set()

  for (const imagePath of imagePaths) {
    const sourcePath = path.join(publicRoot, imagePath.replace(/^\/+/, ''))
    const sourceMetadata = await sharp(sourcePath).metadata()
    if (!sourceMetadata.width || !sourceMetadata.height) {
      throw new Error(`无法读取源图片尺寸: ${imagePath}`)
    }

    const variants = existingManifest[imagePath]
    if (!Array.isArray(variants) || variants.length === 0) {
      throw new Error(`缺少响应式图片清单: ${imagePath}`)
    }

    const expectedWidths = getTargetWidths(sourceMetadata.width)
    const actualWidths = variants.map(variant => variant?.width)
    if (expectedWidths.length !== actualWidths.length ||
        expectedWidths.some((width, index) => width !== actualWidths[index])) {
      throw new Error(`响应式图片宽度不正确: ${imagePath}`)
    }

    const baseName = path.basename(imagePath, path.extname(imagePath))
    for (const [index, variant] of variants.entries()) {
      if (!variant || typeof variant.src !== 'string' || !Number.isInteger(variant.width)) {
        throw new Error(`响应式图片清单格式不正确: ${imagePath}[${index}]`)
      }

      const expectedSrc = `/images/dishes/responsive/${baseName}-${variant.width}.webp`
      if (variant.src !== expectedSrc) {
        throw new Error(`响应式图片路径不正确: ${variant.src}`)
      }

      const variantPath = path.join(publicRoot, variant.src.replace(/^\/+/, ''))
      const variantStats = await stat(variantPath)
      const variantMetadata = await sharp(variantPath).metadata()
      if (variantStats.size === 0 || variantMetadata.format !== 'webp' ||
          variantMetadata.width !== variant.width || !variantMetadata.height) {
        throw new Error(`响应式图片文件不正确: ${variant.src}`)
      }

      const variantFile = path.basename(variantPath)
      if (expectedVariantFiles.has(variantFile)) {
        throw new Error(`响应式图片文件名重复: ${variantFile}`)
      }
      expectedVariantFiles.add(variantFile)
    }
  }

  const actualVariantFiles = new Set(await readdir(outputDirectory))
  if (!setsMatch(expectedVariantFiles, actualVariantFiles)) {
    throw new Error('响应式图片目录存在缺失或冗余文件，请重新生成')
  }

  console.log(`图片校验通过：${imagePaths.length} 张源图，${actualVariantFiles.size} 个响应式变体。`)
}

if (checkOnly) {
  await validateImageOutputs()
  process.exit(0)
}

await rm(outputDirectory, { recursive: true, force: true })
await mkdir(outputDirectory, { recursive: true })

const manifest = {}

for (const imagePath of imagePaths) {
  const relativePath = imagePath.replace(/^\/+/, '')
  const sourcePath = path.join(publicRoot, relativePath)
  await stat(sourcePath)

  const image = sharp(sourcePath)
  const metadata = await image.metadata()
  const sourceWidth = metadata.width

  if (!sourceWidth) throw new Error(`无法读取图片宽度: ${imagePath}`)

  const widths = getTargetWidths(sourceWidth)
  const extension = path.extname(relativePath)
  const baseName = path.basename(relativePath, extension)

  manifest[imagePath] = []

  for (const width of widths) {
    const fileName = `${baseName}-${width}.webp`
    const outputPath = path.join(outputDirectory, fileName)

    await sharp(sourcePath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 76, effort: 5, smartSubsample: true })
      .toFile(outputPath)

    manifest[imagePath].push({
      src: `/images/dishes/responsive/${fileName}`,
      width
    })
  }
}

const generatedFiles = await readdir(outputDirectory)
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

const inventoryRows = [...dishes]
  .sort((first, second) => first.id - second.id)
  .map(dish => {
    const fileName = path.basename(dish.image)
    const externalImage = dish.source?.imageSource
    const source = externalImage
      ? `[${externalImage.name}](${externalImage.url}) \`${externalImage.imagePath}\` by ${externalImage.author} ([${externalImage.license}](${externalImage.licenseUrl})) · ${externalImage.modifications}`
      : dish.source?.repository && dish.source?.url
      ? `[${dish.source.name || dish.source.repository}](${dish.source.url}) \`${dish.source.imagePath}\` @ \`${dish.source.revision.slice(0, 12)}\`${dish.source.license ? ` (${dish.source.license})` : ''}${dish.source.imageCrop ? ' · focus-cropped' : ''}`
      : '来源待补录'
    const variantCount = manifest[dish.image]?.length || 0
    return `| ${dish.id} | ${dish.name} | ${dish.category} | \`${fileName}\` | ${variantCount} | ${source} |`
  })
const inventory = `# Image Inventory

This file is generated by \`pnpm run images:optimize\`. Do not edit it manually.

| ID | Dish | Category | Source image | WebP variants | Provenance |
| ---: | --- | --- | --- | ---: | --- |
${inventoryRows.join('\n')}
`

await writeFile(inventoryPath, inventory)

console.log(`已处理 ${imagePaths.length} 张源图，生成 ${generatedFiles.length} 个 WebP 变体。`)
