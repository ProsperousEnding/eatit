import { execFile as execFileCallback } from 'node:child_process'
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile
} from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { replaceDirectoryAtomically } from './lib/atomic-directory.mjs'
import { writeClientRecipeData } from './recipe-data.mjs'

const execFile = promisify(execFileCallback)
const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const dataPath = path.join(projectRoot, 'src/data/dishes.json')
const imageDirectory = path.join(projectRoot, 'public/images/dishes')
const reportPath = path.join(projectRoot, 'RECIPE_IMPORT_REPORT.md')
const sourceArgumentIndex = process.argv.indexOf('--source')
const sourceValue = sourceArgumentIndex >= 0
  ? process.argv[sourceArgumentIndex + 1] || ''
  : process.env.HOWTOCOOK_SOURCE || ''
const sourceRoot = sourceValue ? path.resolve(sourceValue) : ''
const isExecutedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isExecutedDirectly) {
  if (!sourceRoot || sourceRoot === path.parse(sourceRoot).root) {
    throw new Error('请通过 --source 指定 HowToCook 仓库目录')
  }

  await access(path.join(sourceRoot, 'README.md'))
  await access(path.join(sourceRoot, 'LICENSE'))
  await access(path.join(sourceRoot, 'dishes'))
}

const dishesRoot = path.join(sourceRoot, 'dishes')

const categoryConfig = {
  vegetable_dish: { category: '素菜' },
  meat_dish: { category: '荤菜' },
  aquatic: { category: '水产' },
  breakfast: { category: '早餐' },
  staple: { category: '主食' },
  soup: { category: '汤粥' }
}
const preferredLocalImages = new Map([
  ['荷兰豆炒腊肠', '1.png'],
  ['香煎翘嘴鱼', '香煎翘嘴鱼.jpeg'],
  ['尖叫牛蛙', '尖叫牛蛙.jpg'],
  ['炒方便面', '炒方便面.png']
])
const externalRecipeImages = new Map([
  ['简易红烧肉', {
    assetPath: path.join(projectRoot, 'scripts/assets/red-braised-pork-cc-by-2.0.jpg'),
    name: 'Wikimedia Commons',
    imagePath: 'File:China IMG 3981 (29743084105).jpg',
    author: 'Kuruman from Tokyo, Japan',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    url: 'https://commons.wikimedia.org/wiki/File:China_IMG_3981_(29743084105).jpg',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/China_IMG_3981_%2829743084105%29.jpg',
    modifications: 'resized and re-encoded as JPEG'
  }],
  ['葱烧海参', {
    assetPath: path.join(projectRoot, 'scripts/assets/braised-sea-cucumber-cc-by-sa-4.0.jpg'),
    name: 'Wikimedia Commons',
    imagePath: 'File:Braised Guandong Sea Cucumber with Scallion in Sauce.jpg',
    author: 'Zheng Zhou',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    url: 'https://commons.wikimedia.org/wiki/File:Braised_Guandong_Sea_Cucumber_with_Scallion_in_Sauce.jpg',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Braised_Guandong_Sea_Cucumber_with_Scallion_in_Sauce.jpg',
    modifications: 'cropped to the plated sea cucumber, resized, and re-encoded as JPEG'
  }]
])
const manualImageCrops = new Map([
  ['白灼虾', [0.40, 0.08, 0.58, 0.84]],
  ['葱烧海参', [0.08, 0.24, 0.84, 0.64]],
  ['黄油煎虾', [0.03, 0.15, 0.62, 0.82]],
  ['干煎阿根廷红虾', [0.12, 0.25, 0.72, 0.68]],
  ['芥末黄油罗氏虾', [0.03, 0.33, 0.94, 0.53]],
  ['蒜香黄油虾', [0.02, 0.22, 0.96, 0.75]],
  ['豉汁蒸白鱔', [0.02, 0.05, 0.93, 0.88]],
  ['豆豉鲮鱼油麦菜', [0.12, 0.13, 0.84, 0.78]],
  ['黑椒牛柳', [0.15, 0.13, 0.72, 0.75]],
  ['芥末罗氏虾', [0.04, 0.05, 0.92, 0.90]],
  ['咖喱肥牛', [0.29, 0.18, 0.32, 0.34]],
  ['口水鸡', [0.02, 0.02, 0.86, 0.96]],
  ['老妈蹄花', [0.08, 0.33, 0.84, 0.63]],
  ['黔式腊肠娃娃菜', [0.03, 0.05, 0.65, 0.83]],
  ['无骨鸡爪', [0.04, 0.10, 0.92, 0.85]],
  ['西红柿土豆炖牛肉', [0.18, 0.14, 0.68, 0.60]],
  ['香辣鸡爪煲', [0.08, 0.04, 0.84, 0.58]],
  ['尖叫牛蛙', [0, 0.12, 1, 0.64]],
  ['湘祁米夫鸭', [0.05, 0.06, 0.90, 0.86]],
  ['酱牛肉', [0, 0.08, 0.84, 0.73]],
  ['陈皮排骨汤', [0.02, 0.52, 0.62, 0.46]],
  ['朱雀汤', [0.04, 0.02, 0.92, 0.94]],
  ['河南蒸面条', [0.14, 0.23, 0.72, 0.53]],
  ['煮锅蒸米饭', [0.20, 0.18, 0.60, 0.64]],
  ['炒方便面', [0.51, 0.54, 0.37, 0.40]],
  ['地三鲜', [0.25, 0.12, 0.62, 0.52]],
  ['虎皮青椒', [0.18, 0.12, 0.64, 0.76]],
  ['上汤娃娃菜', [0, 0, 0.78, 0.80]],
  ['糖醋鲤鱼', [0.04, 0.08, 0.92, 0.82]],
  ['香煎翘嘴鱼', [0, 0.02, 1, 0.42]],
  ['阳朔啤酒鱼', [0.02, 0.15, 0.94, 0.78]],
  ['昂刺鱼豆腐汤', [0.05, 0.23, 0.90, 0.73]],
  ['菌菇炖乳鸽', [0.17, 0.07, 0.68, 0.80]],
  ['干锅花菜', [0.12, 0.08, 0.80, 0.85]],
  ['蚝油三鲜菇', [0.05, 0.08, 0.88, 0.82]],
  ['烤茄子', [0.04, 0.14, 0.92, 0.82]],
  ['蒜蓉空心菜', [0.06, 0.18, 0.90, 0.76]],
  ['淄博烧烤', [0.12, 0.02, 0.86, 0.96]],
  ['蒜蓉炒芹菜', [0.06, 0.02, 0.88, 0.96]]
])
const manuallyExcludedRecipes = new Map([
  ['苏格兰蛋', '明显异国风格，不在中式家常菜范围'],
  ['巴基斯坦牛肉咖喱', '明显异国风格，不在中式家常菜范围'],
  ['奶酪培根通心粉', '明显异国风格，不在中式家常菜范围'],
  ['牛排', '明显西式餐点，不在中式家常菜范围'],
  ['炒意大利面', '明显异国风格，不在中式家常菜范围'],
  ['电饭煲三文鱼炊饭', '明显异国风格，不在中式家常菜范围'],
  ['韩式拌饭', '明显异国风格，不在中式家常菜范围'],
  ['基础牛奶面包', '烘焙主食，不在中式家常菜范围'],
  ['鲣鱼海苔玉米饭', '明显异国风格，不在中式家常菜范围'],
  ['空气炸锅照烧鸡饭', '明显异国风格，不在中式家常菜范围'],
  ['日式肥牛丼饭', '明显异国风格，不在中式家常菜范围'],
  ['日式咖喱饭', '明显异国风格，不在中式家常菜范围'],
  ['意式肉酱面', '明显异国风格，不在中式家常菜范围']
])

// Keep upstream data reproducible while applying narrowly scoped corrections for
// omissions, unsafe wording, and values that cannot be inferred by the parser.
const recipeCorrections = new Map([
  ['干煎阿根廷红虾', {
    advanceTime: '若使用冷冻虾，建议提前 1 天转入冷藏室解冻'
  }],
  ['烤鱼', {
    addIngredients: ['孜然粉', '白糖', '生抽'],
    addPreparation: [
      '桂皮 一小片',
      '青花椒 一小把',
      '火锅底料 半包',
      '豆瓣酱 15-20g',
      '白糖 5g',
      '生抽 5ml',
      '孜然粉（上游未标明用量）',
      '绿豆芽（上游未标明用量）',
      '熟花生米（上游未标明用量）',
      '白芝麻（上游未标明用量）',
      '香菜（可选，按口味）'
    ],
    cookingTime: '60分钟'
  }],
  ['糖醋鲤鱼', {
    addIngredients: ['面粉', '鸡蛋', '食用油'],
    addPreparation: [
      '面粉 100g',
      '淀粉 200g（挂糊，另备 10g 调水淀粉）',
      '清水 180g（挂糊，另备 60g 调汁）',
      '鸡蛋 1个',
      '食用油 约1L（炸鱼，实际消耗量较少）'
    ]
  }],
  ['香煎翘嘴鱼', {
    addIngredients: ['干辣椒', '食用油', '鸡精', '十三香', '陈醋'],
    addPreparation: [
      '香菜（按口味）',
      '青椒（上游未标明用量）',
      '豆瓣酱（上游未标明用量）',
      '鸡精（上游未标明用量）',
      '十三香（上游未标明用量）',
      '陈醋（上游未标明用量）'
    ],
    cookingTime: '30分钟',
    advanceTime: '冷藏腌制并冷藏风干 2-4 天',
    stepEdits: [{
      match: /^取出腌制好的鱼，用绳挂起晾晒至半干/,
      replace: '取出腌制好的鱼，用厨房纸吸干表面水分，放在冰箱冷藏室的网架上风干至半干（约 1-2 天）。底部放接水盘，并与即食食物分开；不要在室温或阳光下晾晒。'
    }]
  }],
  ['豉汁蒸白鱔', {
    addIngredients: ['盐'],
    addPreparation: ['盐 3g（可选，用于去腥）']
  }],
  ['宫保鸡丁', {
    methodVariant: '简易版本',
    cookingTime: '30分钟',
    advanceTime: '鸡丁冷藏腌制 1 小时'
  }],
  ['贵州辣子鸡', { cookingTime: '90分钟' }],
  ['回锅肉', {
    methodVariant: '详细家常版',
    stepEdits: [{
      match: /^锅烧热，用手将五花肉紧紧压在锅上炙皮.*$/,
      replace: '优先请肉铺代为烧皮。若自行处理，将锅烧热后用长柄夹或锅铲把五花肉皮面压在锅面炙烤，全程避免用手接近热锅。'
    }]
  }],
  ['姜炒鸡', {
    addIngredients: ['料酒'],
    addPreparation: ['料酒（上游未标明用量）']
  }],
  ['口水鸡', {
    addIngredients: ['盐', '香油', '香菜', '花椒粉'],
    addPreparation: ['盐（按口味）', '香油（上游未标明用量）']
  }],
  ['青椒酿', { methodVariant: '猪肉馅版本' }],
  ['清蒸鳜鱼', { cookingTime: '30分钟' }],
  ['黄油煎虾', { cookingTime: '60分钟' }],
  ['无骨鸡爪', {
    cookingTime: '135分钟',
    advanceTime: '煮后冷冻 20 分钟，拌好后冷藏 6 小时；去骨另需约 2 小时',
    removeSteps: [/^调配好后全部放入准备好的鸡爪$/],
    stepEdits: [{
      match: /^这一步可以省略，此步骤大约花费 2 小时 放入冰箱，冷冻层 20 分钟$/,
      replace: '去骨为可选操作，整个去骨过程约需 2 小时。先将鸡爪放入冰箱冷冻层 20 分钟，便于后续去骨。'
    }]
  }],
  ['西红柿土豆炖牛肉', {
    addIngredients: ['食用油', '盐', '番茄膏或番茄酱'],
    addPreparation: [
      '白糖或冰糖（按口味）',
      '生抽 15ml',
      '老抽（上游未标明用量）',
      '料酒 35ml（焯煮 20ml，炒制 15ml）',
      '番茄膏或番茄酱 5-10g',
      '盐（按口味）'
    ]
  }],
  ['香辣鸡爪煲', {
    addPreparation: [
      '料酒（焯水用，上游未标明用量）',
      '生抽（上游未标明用量）',
      '老抽（上游未标明用量）',
      '辣椒面（可选，按口味）',
      '五香粉（上游未标明用量）',
      '盐（按口味）',
      '鸡精（上游未标明用量）'
    ]
  }],
  ['酱牛肉', {
    cookingTime: '200分钟',
    advanceTime: '清水浸泡 1 小时、冷藏腌制 4-6 小时，煮好后再冷藏数小时',
    stepEdits: [{
      match: /捞出牛腱子肉，捞出牛腱子肉，/,
      replace: '捞出牛腱子肉，'
    }]
  }],
  ['老式锅包肉', {
    cookingTime: '45分钟',
    advanceTime: '若使用推荐挂浆法，土豆淀粉需提前静置沉降 60 分钟'
  }],
  ['梅菜扣肉', {
    cookingTime: '90分钟',
    advanceTime: '梅菜浸泡 1 小时'
  }],
  ['小炒黄牛肉', { cookingTime: '60分钟' }],
  ['羊排焖面', {
    addIngredients: ['食用油', '盐', '中筋面粉'],
    addPreparation: [
      '生姜 4片',
      '干辣椒（上游未标明用量）',
      '花椒（上游未标明用量）',
      '食用油（上游未标明用量）',
      '白砂糖（上游未标明用量）',
      '调味盐（按口味）',
      '老抽（上游未标明用量）',
      '大葱（上游未标明用量）',
      '中筋面粉 300g',
      '和面用盐 3g',
      '和面用水 180ml'
    ],
    stepEdits: [{
      match: /^在此期间，可以和面。和面的量以及操作方法在附加内容里讲解.*$/,
      replace: '炖羊排期间和面：中筋面粉 300g、盐 3g、水 180ml 混合揉匀，按步骤醒面并制成宽面；也可以直接使用超市宽面。'
    }, {
      match: /\s+\*?注 1：可以用超市的面条代替，但是尽量选择宽面。$/,
      replace: ''
    }],
    cookingTime: '90分钟'
  }],
  ['猪皮冻', {
    addIngredients: ['料酒', '白醋', '盐', '味精', '鸡精', '生抽', '老抽', '葱', '姜'],
    addPreparation: ['料酒 50ml', '白醋 20g'],
    cookingTime: '120分钟',
    advanceTime: '猪皮浸泡 12 小时，煮好后还需晾凉并冷藏定型'
  }],
  ['柱候牛腩', {
    addIngredients: ['盐'],
    addPreparation: ['盐（按口味）']
  }],
  ['陈皮排骨汤', { cookingTime: '120分钟' }],
  ['勾芡香菇汤', {
    stepEdits: [{
      match: /加入 3g 盐、3 g ，/,
      replace: '加入 3g 盐、3g 鸡精，'
    }]
  }],
  ['玉米排骨汤', { cookingTime: '90分钟' }],
  ['田螺酿', { advanceTime: '提前半天让田螺吐沙' }],
  ['老妈蹄花', { advanceTime: '白芸豆浸泡一晚' }],
  ['银耳莲子粥', {
    cookingTime: '100分钟',
    advanceTime: '银耳、莲子浸泡 2 小时'
  }],
  ['烙饼', { cookingTime: '60分钟' }],
  ['陕西油泼面', {
    addIngredients: ['花椒', '八角', '桂皮', '香叶', '芝麻（可选）'],
    addPreparation: [
      '花椒（可选，上游未标明用量）',
      '八角（可选，上游未标明用量）',
      '桂皮（可选，上游未标明用量）',
      '香叶（可选，上游未标明用量）',
      '芝麻（可选，上游未标明用量）'
    ]
  }],
  ['凉粉', { advanceTime: '煮好后冷藏定型 2-4 小时' }],
  ['包菜炒鸡蛋粉丝', {
    cookingTime: '20分钟',
    advanceTime: '粉丝冷水浸泡 1 小时'
  }],
  ['地三鲜', {
    addIngredients: ['食用油'],
    addPreparation: [
      '葱 5g',
      '姜 5g',
      '蒜 15g',
      '生抽 10ml',
      '糖 10g',
      '豆瓣酱 15ml',
      '食用油 约180ml（煎炸后会有剩余）',
      '清水 80ml'
    ]
  }],
  ['烤茄子', { cookingTime: '30分钟' }],
  ['榄菜肉末四季豆', {
    addIngredients: ['食用油', '酱油', '盐', '鸡精', '胡椒粉', '糖'],
    addPreparation: [
      '食用油 30ml（滑锅 20ml，炒制 10ml）',
      '酱油 2ml',
      '盐 2g',
      '鸡精 1g',
      '胡椒粉 1g',
      '糖 0.5g'
    ]
  }],
  ['上汤娃娃菜', {
    addIngredients: ['金针菇', '食用油', '蚝油', '味精'],
    addPreparation: [
      '午餐肉或火腿肠（上游未标明用量）',
      '葱 3g',
      '蒜 10g',
      '姜 10g',
      '食用油（上游未标明用量）',
      '清水 300g',
      '蚝油（上游未标明用量）',
      '糖（按口味）',
      '盐（按口味）',
      '味精（按口味）'
    ]
  }],
  ['凉拌木耳', {
    advanceTime: '若使用干木耳，需提前泡发约 45 分钟'
  }]
])

// Metadata audit found one mismatched video and one unavailable video in the pinned source.
const rejectedVideoTutorialUrls = new Set([
  'https://www.bilibili.com/video/BV1g541177cd',
  'https://www.bilibili.com/video/BV1t44y117D8'
])
const videoTutorialTitleOverrides = new Map([
  ['https://www.bilibili.com/video/BV1oF411F7wD', '冬瓜酿肉家常做法'],
  ['https://www.bilibili.com/video/BV1hh41117TL', '晶莹剔透猪皮冻做法'],
  ['https://www.bilibili.com/video/BV1RW411z7r9', '用煮锅做米饭']
])

const normalizeWhitespace = value => value.replace(/\s+/g, ' ').trim()

const removeMarkdownImages = value => value.replace(/!\[([^\]]*)]\((?:[^()]|\([^)]*\))*\)/g, '')

const stripMarkdown = value => normalizeWhitespace(
  value
    .replace(/!\[([^\]]*)]\((?:[^()]|\([^)]*\))*\)/g, '$1')
    .replace(/\[([^\]]+)]\((?:[^()]|\([^)]*\))*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(?<!\*)\*(?=\S)([^*\n]*?\S)\*(?!\*)/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\*+(?=\S)/, '')
    .replace(/\\times/g, '×')
    .replace(/\$/g, '')
)

const normalizeVideoTutorialUrl = (value) => {
  try {
    const url = new URL(value)
    const bilibiliId = url.hostname.endsWith('bilibili.com')
      ? url.pathname.match(/^\/video\/(BV[0-9A-Za-z]+)/)?.[1]
      : null
    if (bilibiliId) return `https://www.bilibili.com/video/${bilibiliId}`

    const douyinPath = url.hostname.endsWith('douyin.com')
      ? url.pathname.match(/^\/(?:video|shipin)\/(\d+)/)?.[0]
      : null
    if (douyinPath) return `https://www.douyin.com${douyinPath}`
  } catch {
    return null
  }

  return null
}

const parseVideoTutorials = (markdown) => {
  const tutorials = []
  const markdownLinkPattern = /\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/g

  for (const match of markdown.matchAll(markdownLinkPattern)) {
    const url = normalizeVideoTutorialUrl(match[2])
    if (!url || rejectedVideoTutorialUrls.has(url) || tutorials.some(item => item.url === url)) continue

    tutorials.push({
      title: videoTutorialTitleOverrides.get(url) || stripMarkdown(match[1]),
      url,
      platform: url.includes('bilibili.com') ? 'bilibili' : 'douyin',
      source: 'HowToCook 上游参考'
    })
  }

  return tutorials
}

const getVideoTutorialPlatforms = (title, references) => {
  const keyword = `${title} 家常做法 教程`
  const platformConfig = [
    {
      key: 'bilibili',
      name: '哔哩哔哩',
      searchUrl: `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`
    },
    {
      key: 'douyin',
      name: '抖音',
      searchUrl: `https://www.douyin.com/search/${encodeURIComponent(keyword)}?type=video`
    }
  ]

  return platformConfig.map(platform => {
    const platformReferences = references.filter(reference => reference.platform === platform.key)
    return {
      ...platform,
      ...(platformReferences.length > 0 ? { references: platformReferences } : {})
    }
  })
}

const getSection = (markdown, heading) => {
  const lines = markdown.split(/\r?\n/)
  const startIndex = lines.findIndex(line => /^##\s+/.test(line) && heading.test(stripMarkdown(line.replace(/^##\s+/, ''))))
  if (startIndex < 0) return []

  const section = []
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) break
    section.push(lines[index])
  }
  return section
}

const parseListItems = lines => lines
  .filter(line => /^\s*[-*]\s+/.test(line))
  .map(line => stripMarkdown(line.replace(/^\s*[-*]\s+/, '')))
  .filter(Boolean)

const toolPattern = /(?:炒锅|汤锅|砂锅|蒸锅|压力锅|高压锅|煮锅|平底煎锅|锅盖|锅铲|铲子|电饭煲|空气炸锅|微波炉|烤箱|烤盘|烤网|烧烤炉|炭火|燃气|蒸笼|蒸篦子|料理机|打蛋器|电子秤|厨房纸|吸油纸|保鲜膜|砧板|菜刀|水果刀|笊篱|漏勺|厨房用夹|筷子|簸箕|模具|温度计|牙签|冰箱|盆|砵|耐热盘|小碗)/
const listGroupPattern = /^(?:(?:必须|可选|必选|主要|其它|其他|进阶)?(?:原料|配料|调料|材料)|小料|调味品|酒（任选其一）)[:：]?$/
const sourceNotePattern = /^(?:注[:：]|注意[:：]|说明[:：])/i

const splitCombinedListItem = item => item.split(/\s*\+\s*/).map(part => part.trim()).filter(Boolean)

const isToolItem = item => {
  const baseItem = item.replace(/[（(].*$/, '').trim()
  return baseItem === '锅' || toolPattern.test(baseItem)
}

const getIngredientAndToolItems = markdown => parseListItems(getSection(markdown, /^必备原料和工具$/))
  .flatMap(splitCombinedListItem)
  .filter(item => !listGroupPattern.test(item) && !sourceNotePattern.test(item))

const parseIngredients = markdown => [...new Set(
  getIngredientAndToolItems(markdown)
    .filter(item => !isToolItem(item))
)]

const parseTools = markdown => [...new Set(
  getIngredientAndToolItems(markdown)
    .filter(item => isToolItem(item))
)]

const concreteQuantityPattern = /(?:\d|[一二两三四五六七八九十半]+\s*(?:个|只|条|根|块|片|颗|粒|瓣|勺|杯|碗|斤|两|克|毫升|升|支|包|瓶|张|把|朵)|适量|少许)/i
const quantityGuidancePattern = /(?:参照|按比例|按口味|个人口味|根据.+口味|可选|随意|酌量)/

const parsePreparation = markdown => [...new Set(
  parseListItems(getSection(markdown, /^计算$/))
    .filter(item => !listGroupPattern.test(item))
    .map(item => item
      .replace(/^[-–—]\s*/, '')
      .replace(/\s+([，。；])/g, '$1')
      .trim())
    .map(item => {
      const assignment = item.match(/^([^=]+)\s*=\s*([^=]+)$/)
      if (!assignment || concreteQuantityPattern.test(assignment[1]) || /[*×]/.test(assignment[2])) return item
      return `${assignment[1].trim()}：${assignment[2].trim()}`
    })
    .map(item => concreteQuantityPattern.test(item) || quantityGuidancePattern.test(item)
      ? item
      : `${item}（上游未标明用量）`)
    .filter(Boolean)
)]

const getServingDescription = (markdown) => {
  const line = getSection(markdown, /^计算$/)
    .map(stripMarkdown)
    .find(item => item && !/^[-*]/.test(item) && /(?:每份|一份|份量|[人位]份|够\s*\d+\s*人)/.test(item))
  return line || ''
}

const selectOperationLines = (lines) => {
  const headings = lines
    .map((line, index) => ({ index, title: stripMarkdown(line.replace(/^###\s+/, '')) }))
    .filter(item => /^###\s+/.test(lines[item.index]))
  const versionHeadings = headings.filter(item => /(?:版本|版做法|做法[一二三四]?|方式[一二三四]?)/.test(item.title))

  if (versionHeadings.length === 0) return lines

  const first = versionHeadings[0]
  const firstNumberedStep = lines.findIndex(line => /^\s*\d+[.、]\s+/.test(line))

  if (firstNumberedStep >= 0 && first.index > firstNumberedStep) {
    return lines.slice(0, first.index)
  }

  const next = versionHeadings[1]
  return lines.slice(first.index + 1, next?.index)
}

const parseSteps = (markdown) => {
  const lines = selectOperationLines(getSection(markdown, /^操作$/))
  const steps = []
  let currentStep = ''
  let pendingContext = ''

  const flushStep = () => {
    const normalized = stripMarkdown(currentStep)
    if (normalized && !/^!\[/.test(normalized)) steps.push(normalized)
    currentStep = ''
  }

  for (const rawLine of lines) {
    if (/^###\s+/.test(rawLine)) {
      flushStep()
      pendingContext = ''
      continue
    }

    const numberedStep = rawLine.match(/^\s*\d+[.、]\s+(.+)$/)
    if (numberedStep) {
      flushStep()
      const stepText = removeMarkdownImages(numberedStep[1]).trim()
      currentStep = [pendingContext, stepText].filter(Boolean).join(' ')
      pendingContext = ''
      continue
    }

    if (!rawLine.trim() || rawLine.includes('![')) continue

    if (!currentStep) {
      if (!/^\s*</.test(rawLine)) pendingContext = stripMarkdown(rawLine.replace(/^\s*>\s*/, ''))
      continue
    }

    const nestedItem = rawLine.match(/^\s*[-*]\s+(.+)$/)
    if (nestedItem) {
      const separator = /[：:]$/.test(currentStep.trim()) ? '' : '；'
      currentStep = `${currentStep}${separator}${nestedItem[1]}`
      continue
    }

    if (!/^\s*</.test(rawLine)) currentStep = `${currentStep} ${rawLine.trim()}`
  }

  flushStep()
  return steps
}

const appendUnique = (items, additions = []) => [...new Set([...items, ...additions])]

const applyRecipeCorrection = (title, recipe) => {
  const correction = recipeCorrections.get(title)
  if (!correction) return recipe

  let steps = recipe.steps
  if (correction.removeSteps) {
    steps = steps.filter(step => !correction.removeSteps.some(pattern => pattern.test(step)))
  }
  if (correction.stepEdits) {
    steps = steps.map(step => correction.stepEdits.reduce(
      (value, edit) => value.replace(edit.match, edit.replace),
      step
    ))
  }

  return {
    ...recipe,
    ingredients: appendUnique(recipe.ingredients, correction.addIngredients),
    preparation: appendUnique(recipe.preparation, correction.addPreparation),
    steps,
    cookingTime: correction.cookingTime || recipe.cookingTime,
    methodVariant: correction.methodVariant || '',
    advanceTime: correction.advanceTime || '',
    correctionCount: [
      ...(correction.addIngredients || []),
      ...(correction.addPreparation || []),
      ...(correction.removeSteps || []),
      ...(correction.stepEdits || []),
      ...(correction.cookingTime ? ['cookingTime'] : []),
      ...(correction.advanceTime ? ['advanceTime'] : []),
      ...(correction.methodVariant ? ['methodVariant'] : [])
    ].length
  }
}

const normalizeImageLabel = value => stripMarkdown(value)
  .replace(/的做法$/, '')
  .replace(/[\s（）()【】·._-]/g, '')
  .replaceAll('[', '')
  .replaceAll(']', '')
  .replace(/^(?:简易版?|微波炉|煮锅|电饭煲|空气炸锅)/, '')

const parseImageReferences = (markdown) => {
  const references = []

  for (const [index, line] of markdown.split(/\r?\n/).entries()) {
    const imageStart = line.indexOf('![')
    const pathStart = line.indexOf('](', imageStart + 2)
    const pathEnd = line.lastIndexOf(')')
    if (imageStart < 0 || pathStart < 0 || pathEnd <= pathStart + 2) continue

    references.push({
      index,
      alt: line.slice(imageStart + 2, pathStart),
      reference: line.slice(pathStart + 2, pathEnd).trim()
    })
  }

  return references
}

const safeDecodeURIComponent = value => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const getBestLocalImage = async (markdown, recipePath, title) => {
  const normalizedTitle = normalizeImageLabel(title)
  const candidates = []

  for (const image of parseImageReferences(markdown)) {
    if (/^https?:\/\//i.test(image.reference)) continue

    const reference = safeDecodeURIComponent(image.reference.replace(/^\.\//, ''))
    const sourceImagePath = path.resolve(path.dirname(recipePath), reference)
    if (!sourceImagePath.startsWith(`${dishesRoot}${path.sep}`)) continue

    try {
      await access(sourceImagePath)
      const metadata = await sharp(sourceImagePath).metadata()
      if (!metadata.width || !metadata.height) continue
    } catch {
      continue
    }

    const normalizedAlt = normalizeImageLabel(image.alt)
    const normalizedFileName = normalizeImageLabel(path.basename(sourceImagePath, path.extname(sourceImagePath)))
    let score = 0

    if (normalizedAlt.includes(normalizedTitle) || normalizedFileName.includes(normalizedTitle)) score += 100
    else if ((normalizedTitle.includes(normalizedAlt) && normalizedAlt.length >= 2) ||
      (normalizedTitle.includes(normalizedFileName) && normalizedFileName.length >= 2)) score += 70
    if (/(?:成品|出锅|完成)/.test(`${image.alt} ${image.reference}`)) score += 40
    if (/预览/.test(image.alt)) score += 20
    if (/参考/.test(image.alt)) score += 10
    if (/(?:食材|配料|步骤|改刀|摆盘|调料|薄荷|水煮|过滤|半成品)/.test(image.alt)) score -= 40
    if (preferredLocalImages.get(title) === path.basename(sourceImagePath)) score += 1000

    candidates.push({ ...image, sourceImagePath, score })
  }

  candidates.sort((first, second) => second.score - first.score || second.index - first.index)
  return candidates[0]?.score >= 20 ? candidates[0] : null
}

const getExternalImage = async (title) => {
  const config = externalRecipeImages.get(title)
  if (!config) return null

  const { assetPath, ...imageSource } = config
  await access(assetPath)
  const metadata = await sharp(assetPath).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error(`无法读取外部替代图片: ${title}`)
  }

  return {
    sourceImagePath: assetPath,
    score: 1000,
    imageSource
  }
}

const getTaste = text => {
  if (/酸辣|醋溜|泡椒|酸菜/.test(text)) return '酸辣'
  if (/麻辣|香辣|辣椒|辣子|水煮牛肉|宫保|麻婆/.test(text)) return '香辣'
  if (/糖醋|可乐|拔丝|甜|蜜|糖拌/.test(text)) return '甜香'
  if (/清蒸|白灼|清炒|清淡|蒸蛋|鸡蛋羹|汤|粥/.test(text)) return '清淡'
  return '咸鲜'
}

const getCookingMethod = (title, category, steps) => {
  const text = `${title} ${steps.join(' ')}`
  if (/凉拌|拌菜|拌匀/.test(title)) return '凉拌'
  if (/蒸|蒸制|清蒸/.test(title)) return '蒸制'
  if (/烤|烘烤/.test(title)) return '烤制'
  if (/炸|油炸|拔丝/.test(title)) return '炸制'
  if (/煎|煎制/.test(title)) return '煎制'
  if (/炖|煲|汤|粥/.test(title) || category === '汤粥') return '炖煮'
  if (/焖|红烧|卤|烧制/.test(title)) return '焖烧'
  if (/面|粉|水煮|白灼|煮制/.test(title) || category === '主食') return '煮制'
  if (/蒸/.test(text)) return '蒸制'
  return category === '早餐' ? '早餐制作' : '炒制'
}

const chineseNumberToNumber = value => {
  const digits = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }
  if (value === '十') return 10
  if (value.includes('十')) {
    const [tens, ones] = value.split('十')
    return (digits[tens] || 1) * 10 + (digits[ones] || 0)
  }
  return digits[value] || 0
}

const getCookingTime = (markdown, steps) => {
  const introduction = markdown.split(/^##\s+/m)[0]
  const rangeMatch = introduction.match(/(\d+(?:\.\d+)?)\s*(?:-|–|—|~|～|至)\s*(\d+(?:\.\d+)?)\s*分钟/)
  if (rangeMatch) return `${Math.ceil(Number(rangeMatch[2]))}分钟`

  const combinedMatch = introduction.match(/(\d+(?:\.\d+)?)\s*(?:个)?小时\s*(\d+(?:\.\d+)?)\s*分钟/)
  if (combinedMatch) {
    return `${Math.ceil(Number(combinedMatch[1]) * 60 + Number(combinedMatch[2]))}分钟`
  }

  const chineseHalfHourMatch = introduction.match(/([一二两三四五六七八九十]{1,3})\s*(?:个)?半\s*小时/)
  if (chineseHalfHourMatch) {
    return `${chineseNumberToNumber(chineseHalfHourMatch[1]) * 60 + 30}分钟`
  }

  if (/半\s*小时/.test(introduction)) return '30分钟'

  const hourMatch = introduction.match(/(\d+(?:\.\d+)?)\s*小时/)
  if (hourMatch) return `${Math.ceil(Number(hourMatch[1]) * 60)}分钟`

  const chineseHourMatch = introduction.match(/([一二两三四五六七八九十]{1,3})\s*(?:个)?小时/)
  if (chineseHourMatch) return `${chineseNumberToNumber(chineseHourMatch[1]) * 60}分钟`

  const minuteMatch = introduction.match(/(\d+(?:\.\d+)?)\s*分钟/)
  if (minuteMatch) return `${Math.ceil(Number(minuteMatch[1]))}分钟`

  const chineseMinuteMatch = introduction.match(/([一二两三四五六七八九十]{1,3})\s*分钟/)
  if (chineseMinuteMatch) return `${chineseNumberToNumber(chineseMinuteMatch[1])}分钟`

  return `${Math.min(180, Math.max(10, steps.length * 5))}分钟`
}

const getDifficulty = markdown => {
  const stars = markdown.match(/^预估烹饪难度：(★+)/m)?.[1].length || 3
  if (stars <= 2) return '简单'
  if (stars === 3) return '普通'
  return '复杂'
}

const getCalories = markdown => {
  const calories = stripMarkdown(markdown.match(/^预估卡路里：(.+)$/m)?.[1] || '')
  return calories ? { calories } : null
}

export {
  getCalories,
  getCookingTime,
  getDifficulty,
  getServingDescription,
  getVideoTutorialPlatforms,
  parseIngredients,
  parsePreparation,
  parseSteps,
  parseTools,
  parseVideoTutorials,
  stripMarkdown
}

const getCropRegion = async (sourceImagePath, title) => {
  const crop = manualImageCrops.get(title)
  if (!crop) return null

  const metadata = await sharp(sourceImagePath).metadata()
  const width = metadata.autoOrient.width
  const height = metadata.autoOrient.height
  const [leftRatio, topRatio, widthRatio, heightRatio] = crop
  const left = Math.round(width * leftRatio)
  const top = Math.round(height * topRatio)

  return {
    left,
    top,
    width: Math.min(Math.round(width * widthRatio), width - left),
    height: Math.min(Math.round(height * heightRatio), height - top)
  }
}

if (isExecutedDirectly) {
const { stdout: revisionOutput } = await execFile('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot })
const revision = revisionOutput.trim()
const sourceFiles = []

for (const directory of Object.keys(categoryConfig)) {
  const categoryRoot = path.join(dishesRoot, directory)
  const entries = await readdir(categoryRoot, { recursive: true, withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue
    sourceFiles.push({
      directory,
      recipePath: path.join(entry.parentPath, entry.name)
    })
  }
}

sourceFiles.sort((first, second) => first.recipePath.localeCompare(second.recipePath, 'zh-CN'))

const parsedRecipes = []
const excludedRecipes = []

for (const [index, sourceFile] of sourceFiles.entries()) {
  const markdown = await readFile(sourceFile.recipePath, 'utf8')
  const title = stripMarkdown(markdown.match(/^#\s+(.+)$/m)?.[1] || '').replace(/的做法$/, '').trim()
  const parsedSteps = parseSteps(markdown)
  const parsedRecipe = applyRecipeCorrection(title, {
    ingredients: parseIngredients(markdown),
    tools: parseTools(markdown),
    preparation: parsePreparation(markdown),
    steps: parsedSteps,
    cookingTime: getCookingTime(markdown, parsedSteps)
  })
  const { ingredients, tools, preparation, steps } = parsedRecipe
  const image = await getExternalImage(title) ||
    await getBestLocalImage(markdown, sourceFile.recipePath, title)
  const reasons = []

  if (!title) reasons.push('缺少菜名')
  if (ingredients.length < 2) reasons.push('原料表不完整')
  if (preparation.length < 2) reasons.push('缺少可执行的食材用量')
  if (steps.length < 2) reasons.push('烹饪步骤不完整')
  if (!image) reasons.push('缺少与菜名匹配的本地成品图')
  if (manuallyExcludedRecipes.has(title)) reasons.push(manuallyExcludedRecipes.get(title))

  if (reasons.length > 0) {
    excludedRecipes.push({
      id: 2001 + index,
      title: title || path.basename(sourceFile.recipePath, '.md'),
      category: categoryConfig[sourceFile.directory].category,
      recipePath: path.relative(sourceRoot, sourceFile.recipePath).split(path.sep).join('/'),
      reasons
    })
    continue
  }

  parsedRecipes.push({
    id: 2001 + index,
    title,
    category: categoryConfig[sourceFile.directory].category,
    ingredients,
    tools,
    preparation,
    steps,
    servings: getServingDescription(markdown),
    cookingTime: parsedRecipe.cookingTime,
    methodVariant: parsedRecipe.methodVariant,
    advanceTime: parsedRecipe.advanceTime,
    correctionCount: parsedRecipe.correctionCount || 0,
    difficulty: getDifficulty(markdown),
    nutrition: getCalories(markdown),
    videoTutorials: parseVideoTutorials(markdown),
    recipePath: sourceFile.recipePath,
    sourceImagePath: image.sourceImagePath,
    imageScore: image.score,
    externalImageSource: image.imageSource || null
  })
}

if (parsedRecipes.length === 0) throw new Error('没有找到结构完整且带成品图的家常菜谱')

const duplicateNames = parsedRecipes
  .map(recipe => recipe.title)
  .filter((name, index, names) => names.indexOf(name) !== index)
if (duplicateNames.length > 0) throw new Error(`上游存在重复菜名: ${[...new Set(duplicateNames)].join('、')}`)

await mkdir(path.dirname(imageDirectory), { recursive: true })
const stagingDirectory = await mkdtemp(path.join(path.dirname(imageDirectory), '.dishes-next-'))
const dishes = []

try {
  try {
    await cp(path.join(imageDirectory, 'responsive'), path.join(stagingDirectory, 'responsive'), { recursive: true })
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  for (const recipe of parsedRecipes) {
    const imageFileName = `htc-${recipe.id}.jpg`
    const githubPath = path.relative(sourceRoot, recipe.recipePath)
      .split(path.sep)
      .map(segment => encodeURIComponent(segment))
      .join('/')

    const cropRegion = await getCropRegion(recipe.sourceImagePath, recipe.title)
    let imagePipeline = sharp(recipe.sourceImagePath).autoOrient()
    if (cropRegion) imagePipeline = imagePipeline.extract(cropRegion)

    await imagePipeline
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
      .toFile(path.join(stagingDirectory, imageFileName))

    dishes.push({
      id: recipe.id,
      name: recipe.title,
      image: `/images/dishes/${imageFileName}`,
      category: recipe.category,
      taste: getTaste(`${recipe.title} ${recipe.ingredients.join(' ')} ${recipe.steps.join(' ')}`),
      cookingMethod: getCookingMethod(recipe.title, recipe.category, recipe.steps),
      difficulty: recipe.difficulty,
      cookingTime: recipe.cookingTime,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      ...(recipe.tools.length > 0 ? { tools: recipe.tools } : {}),
      preparation: recipe.preparation,
      steps: recipe.steps,
      ...(recipe.methodVariant ? { methodVariant: recipe.methodVariant } : {}),
      ...(recipe.advanceTime ? { advanceTime: recipe.advanceTime } : {}),
      nutrition: recipe.nutrition,
      videoTutorials: {
        platforms: getVideoTutorialPlatforms(recipe.title, recipe.videoTutorials)
      },
      source: {
        name: 'HowToCook',
        repository: 'Anduin2017/HowToCook',
        revision,
        license: 'Unlicense',
        recipePath: path.relative(sourceRoot, recipe.recipePath).split(path.sep).join('/'),
        imagePath: recipe.externalImageSource?.imagePath ||
          path.relative(sourceRoot, recipe.sourceImagePath).split(path.sep).join('/'),
        ...(recipe.externalImageSource ? { imageSource: recipe.externalImageSource } : {}),
        ...(manualImageCrops.has(recipe.title) ? { imageCrop: manualImageCrops.get(recipe.title) } : {}),
        ...(recipe.correctionCount > 0 ? { editorialCorrections: recipe.correctionCount } : {}),
        url: `https://github.com/Anduin2017/HowToCook/blob/${revision}/${githubPath}`
      }
    })
  }

  await replaceDirectoryAtomically(imageDirectory, stagingDirectory)

  const categories = [...new Set(dishes.map(dish => dish.category))]
  const cookingMethods = [...new Set(dishes.map(dish => dish.cookingMethod))]
  const output = {
    DISH_CHARACTERISTICS: {
      COOKING_METHODS: Object.fromEntries(cookingMethods.map((method, index) => [`METHOD_${index + 1}`, method])),
      TASTES: {
        LIGHT: '清淡',
        SAVORY: '咸鲜',
        SPICY: '香辣',
        SOUR_SPICY: '酸辣',
        SWEET: '甜香'
      },
      DIFFICULTY: {
        SIMPLE: '简单',
        NORMAL: '普通',
        COMPLEX: '复杂'
      },
      CATEGORIES: Object.fromEntries(categories.map((category, index) => [`CATEGORY_${index + 1}`, category]))
    },
    HOWTOCOOK_DISHES: dishes
  }
  await writeFile(dataPath, `${JSON.stringify(output, null, 2)}\n`)
  await writeClientRecipeData(output)

  const reasonCounts = excludedRecipes.reduce((counts, recipe) => {
    for (const reason of recipe.reasons) counts[reason] = (counts[reason] || 0) + 1
    return counts
  }, {})
  const correctedDishCount = dishes.filter(dish => dish.source.editorialCorrections).length
  const videoReferences = dish => dish.videoTutorials.platforms.flatMap(platform => platform.references || [])
  const videoReferenceDishCount = dishes.filter(dish => videoReferences(dish).length).length
  const videoReferenceCount = dishes.reduce((count, dish) => count + videoReferences(dish).length, 0)
  const report = `# HowToCook Import Report

This file is generated by \`pnpm run recipes:import:howtocook\`. Do not edit it manually.

- Upstream revision: \`${revision}\`
- Core-category recipe files: ${sourceFiles.length}
- Imported recipes: ${dishes.length}
- Excluded recipes: ${excludedRecipes.length}
- Recipes with audited editorial corrections: ${correctedDishCount}
- Recipes with audited upstream video references: ${videoReferenceDishCount} (${videoReferenceCount} links)
- Video search platforms per recipe: 2 (Bilibili and Douyin)

## Import Rules

Only recipes in \`vegetable_dish\`, \`meat_dish\`, \`aquatic\`, \`breakfast\`, \`staple\`, and \`soup\` are considered. Each imported recipe must contain at least two ingredients, two quantified preparation items, two cooking steps, and a readable local image that matches the dish name or is identified as a finished/preview image. Explicit alternative versions are imported as one coherent method instead of merging their steps. Tools are kept separate from ingredients, while long soaking, marinating, thawing, or setting periods are recorded separately from active cooking time. Narrow editorial corrections fill upstream omissions, remove unsafe wording, and fix confirmed values without hiding the pinned upstream revision. An audited, checked-in external replacement may be used when the upstream image is unsuitable and its author, license, source URL, and modifications are recorded. Clearly foreign-style meals and bakery staples are excluded from EatIt's Chinese household recipe scope. Imported images are auto-oriented and may use an audited crop to remove unrelated tableware, food, people, devices, or kitchen clutter.

${Object.entries(reasonCounts).map(([reason, count]) => `- ${reason}: ${count}`).join('\n')}

## Imported

| ID | Recipe | Category | Recipe path | Image path | Treatment |
| ---: | --- | --- | --- | --- | --- |
${dishes.map(dish => `| ${dish.id} | ${dish.name} | ${dish.category} | \`${dish.source.recipePath}\` | \`${dish.source.imagePath}\` | ${dish.source.imageSource ? 'licensed external replacement + auto-orient' : dish.source.imageCrop ? 'auto-orient + focus crop' : 'auto-orient'} |`).join('\n')}

## Excluded

| ID | Recipe | Category | Reasons |
| ---: | --- | --- | --- |
${excludedRecipes.map(recipe => `| ${recipe.id} | ${recipe.title} | ${recipe.category} | ${recipe.reasons.join('；')} |`).join('\n')}
`
  await writeFile(reportPath, report)
} finally {
  await rm(stagingDirectory, { recursive: true, force: true })
}

console.log(`已从 HowToCook@${revision.slice(0, 12)} 导入 ${dishes.length} 个带匹配图片的家常菜谱，排除 ${excludedRecipes.length} 个不符合导入条件的条目。`)
}
