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
  ['炒方便面', '炒方便面.png'],
  ['葱油桂鱼', '葱油桂鱼.jpg'],
  ['西红柿鸡蛋挂面', 'tomatoNoodle.jpg'],
  ['青椒土豆炒肉', '青椒土豆炒肉.jpg'],
  ['土豆炖排骨', '排骨2.jpg']
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
  }],
  ['西红柿鸡蛋汤', {
    assetPath: path.join(projectRoot, 'scripts/assets/tomato-egg-soup-cc-by-3.0.jpg'),
    name: 'Wikimedia Commons',
    imagePath: 'File:Tomato and egg soup.jpg',
    author: 'NNU-10-HanRongrong',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    url: 'https://commons.wikimedia.org/wiki/File:Tomato_and_egg_soup.jpg',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Tomato_and_egg_soup.jpg',
    modifications: 'resized and re-encoded as JPEG'
  }],
  ['皮蛋瘦肉粥', {
    assetPath: path.join(projectRoot, 'scripts/assets/century-egg-pork-congee-cc-by-sa-4.0.jpg'),
    name: 'Wikimedia Commons',
    imagePath: 'File:A century eggs and Pork Congee from Chi Kee Congee Shop.jpg',
    author: 'Peachyeung316',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    url: 'https://commons.wikimedia.org/wiki/File:A_century_eggs_and_Pork_Congee_from_Chi_Kee_Congee_Shop.jpg',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/A_century_eggs_and_Pork_Congee_from_Chi_Kee_Congee_Shop.jpg',
    modifications: 'cropped to the bowl, resized, and re-encoded as JPEG'
  }],
  ['小米粥', {
    assetPath: path.join(projectRoot, 'scripts/assets/millet-congee-cc-by-sa-4.0.jpg'),
    name: 'Wikimedia Commons',
    imagePath: 'File:A BOWL OF FOXTAIL MILLET CONGEE.jpg',
    author: 'Dinkun Chen',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    url: 'https://commons.wikimedia.org/wiki/File:A_BOWL_OF_FOXTAIL_MILLET_CONGEE.jpg',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/A_BOWL_OF_FOXTAIL_MILLET_CONGEE.jpg',
    modifications: 'resized and re-encoded as JPEG'
  }],
  ['蛋炒饭', {
    assetPath: path.join(projectRoot, 'scripts/assets/egg-fried-rice-cc-by-sa-4.0.jpg'),
    name: 'Wikimedia Commons',
    imagePath: 'File:Egg Fried Rice from a Chinese Home.jpg',
    author: 'Tofu fighting',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    url: 'https://commons.wikimedia.org/wiki/File:Egg_Fried_Rice_from_a_Chinese_Home.jpg',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Egg_Fried_Rice_from_a_Chinese_Home.jpg',
    modifications: 'resized and re-encoded as JPEG'
  }],
  ['炸酱面', {
    assetPath: path.join(projectRoot, 'scripts/assets/zhajiangmian-cc-by-sa-4.0.jpg'),
    name: 'Wikimedia Commons',
    imagePath: 'File:Noodles with diced meat soybean paste before stirring (20210102181759).jpg',
    author: 'N509FZ',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    url: 'https://commons.wikimedia.org/wiki/File:Noodles_with_diced_meat_soybean_paste_before_stirring_(20210102181759).jpg',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Noodles_with_diced_meat_soybean_paste_before_stirring_%2820210102181759%29.jpg',
    modifications: 'cropped to the noodle bowl, resized, and re-encoded as JPEG'
  }],
  ['热干面', {
    assetPath: path.join(projectRoot, 'scripts/assets/hot-dry-noodles-cc-by-sa-4.0.jpg'),
    name: 'Wikimedia Commons',
    imagePath: 'File:Hot Dry Noodles.jpg',
    author: 'ZhengZhou',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    url: 'https://commons.wikimedia.org/wiki/File:Hot_Dry_Noodles.jpg',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Hot_Dry_Noodles.jpg',
    modifications: 'resized and re-encoded as JPEG'
  }],
  ['凉拌黄瓜', {
    assetPath: path.join(projectRoot, 'scripts/assets/cucumber-salad-cc-by-2.0.jpg'),
    name: 'Wikimedia Commons',
    imagePath: 'File:Pai huang gua.jpg',
    author: 'John',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    url: 'https://commons.wikimedia.org/wiki/File:Pai_huang_gua.jpg',
    originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Pai_huang_gua.jpg',
    modifications: 're-encoded as JPEG'
  }]
])

const additionalExternalRecipeImages = [
  ['红烧鱼', 'braised-fish.jpg', 'File:红烧明太鱼.jpg', 'E2568', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['清蒸生蚝', 'steamed-oysters.jpg', 'File:Freshippo steamed oysters with vermicelli and garlic.jpg', 'Fumikas Sagisavas', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['水煮鱼', 'shuizhu-fish.jpg', 'File:Shuizhufish2.JPG', 'Jiaqing Pan / Princevegetam', 'GFDL', 'https://www.gnu.org/licenses/fdl-1.2.html'],
  ['黄焖鸡', 'yellow-braised-chicken.jpg', 'File:Yellow braised chicken.jpg', 'Fumikas Sagisavas', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['可乐鸡翅', 'cola-chicken-wings.jpg', 'File:Home made chicken wings with coca cola.jpg', 'Pauloleong2002', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['辣椒炒肉', 'hunan-pepper-pork.jpg', 'File:Chinese food in Hunan.jpg', 'CHENG SHIYI', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['糖醋里脊', 'sweet-sour-pork.jpg', 'File:Sweet sour pork.jpg', 'BorgQueen', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['麻辣香锅', 'mala-xiang-guo.jpg', 'File:Ma La Xiang Guo.jpg', '我乃野云鹤', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['孜然牛肉', 'cumin-beef.jpg', 'File:Sanxia Renjia, Fitzrovia, London (5561016228).jpg', 'Ewan Munro', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/'],
  ['水煮肉片', 'shuizhu-pork.jpg', 'File:Shuizhu Roupian at Daqian Restaurant, Dachenglu (20260126131419).jpg', 'N509FZ', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['小酥肉', 'crispy-pork.jpg', 'File:Freshippo crispy pork tenderloin.jpg', 'Fumikas Sagisavas', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['腊八粥', 'laba-congee.jpg', 'File:Laba Congee at Hongzhuangyuan, Shangdi (20220110173848).jpg', 'N509FZ', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['紫菜蛋花汤', 'seaweed-egg-drop-soup.jpg', 'File:Egg Drop Soup (蛋花湯）.jpg', 'Ralff Nestor Nacor', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['生汆丸子汤', 'pork-meat-ball-soup.jpg', 'File:Pork Meat Ball Soup.jpg', 'Sumit Surai', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['葱油拌面', 'scallion-oil-noodles.jpg', "File:Food 上海菜, 滬菜, 本幫菜, 上海, 中華人民共和國, 中國, Shanghai, People's Republic of China, PRC, China (30427507516).jpg", 'bryan...', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/'],
  ['韭菜盒子', 'chive-pockets.jpg', 'File:Jiucai Hezi at Dongsi Minfang Restaurant, Chongwenmen (20220215114852)-cropped.jpg', 'N509FZ', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['手工水饺', 'boiled-dumplings.jpg', 'File:Shui jiao.jpg', 'lazy fri13th', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/'],
  ['鲜肉烧卖', 'pork-shumai.jpg', 'File:Homemade style pork shumai in Hong Kong.jpg', 'Peachyeung316', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['扬州炒饭', 'yangzhou-fried-rice.jpg', "File:Hung Hom Station Maxim's MX Yangzhou fried rice 11-01-2023.jpg", 'LN9267', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['猪油拌饭', 'lard-rice.jpg', "File:Rice with Whitebait and Lard at Chua Lam's Dim Sum, Dongzhimen (20200813174339).jpg", 'N509FZ', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['红烧茄子', 'braised-eggplant.jpg', 'File:Hong shao qie zi.jpg', 'chomjong', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/'],
  ['皮蛋豆腐', 'century-egg-tofu.jpg', 'File:Tofu with Century Egg 02.jpg', 'Tbatb', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['酸辣土豆丝', 'hot-sour-shredded-potato.jpg', 'File:Taste of Beijing, Soho, London (4363975792).jpg', 'Ewan Munro', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/'],
  ['蒜蓉西兰花', 'stir-fried-broccoli.jpg', 'File:Stir-fried broccoli.jpg', 'Fumikas Sagisavas', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['上汤娃娃菜', 'yunnan-ham-cabbage-soup.jpg', 'File:Yunnan ham and Chinese Cabbage Soup - Hongfa Canting.jpg', 'Alpha', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/'],
  ['西红柿炒鸡蛋', 'tomato-scrambled-eggs.jpg', 'File:Hunan cuisine, stir-fried tomato with eggs.jpg', 'Huangdan2060', 'CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/'],
  ['凉拌金针菇', 'enoki-mushroom-salad.jpg', 'File:Salad enoki mushrooms.jpg', 'Fumikas Sagisavas', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['茶叶蛋', 'tea-eggs.jpg', 'File:Tea eggs ez.jpg', 'Dllu', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['水煮玉米', 'boiled-corn.jpg', 'File:Boiled corn on a white plate.jpg', 'TudorTulok', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['牛奶燕麦', 'milk-oatmeal.jpg', 'File:Oatmeal (1).jpg', 'Renee Comet', 'Public domain', 'https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia'],
  ['手抓饼', 'shou-zhua-bing.jpg', 'File:Cong zhua bing.jpg', 'Joy', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/'],
  ['煎饺', 'pan-fried-dumplings.jpg', 'File:煎饺.jpg', 'Yangbinlive', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'],
  ['燕麦鸡蛋饼', 'oatmeal-pancake.jpg', 'File:Oatmeal pancake with fruit.jpg', 'Drhnn', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['香煎翘嘴鱼', 'pan-fried-fish.jpg', 'File:Fried fish of Lijiang.jpg', 'Kent Wang', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/'],
  ['黑椒牛柳', 'black-pepper-beef.jpg', 'File:黑椒牛肉饭 Black Pepper Beef on rice - Hongyun Chinese Restaurant AUD8.50 (3450250738).jpg', 'Alpha', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/'],
  ['红烧猪蹄', 'braised-pork-trotters.jpg', 'File:Braised pork trotters.jpg', 'Fumikas Sagisavas', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['酱牛肉', 'soy-sauce-beef.jpg', 'File:Beef seasoned with soy sauce at Lady Chai, Ganjiakou (20211022125335).jpg', 'N509FZ', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['咖喱肥牛', 'curry-sliced-beef-rice.jpg', 'File:咖喱牛肉饭.jpg', 'Richard923888', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['羊肉汤', 'mutton-soup.jpg', 'File:Shanxian Mutton Soup in Beijing (20230224111441).jpg', 'N509FZ', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['炒滑蛋', 'scrambled-eggs.jpg', 'File:Scrambled egg on plate.jpg', 'Chammy17', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['凉拌鸡丝', 'shredded-chicken-salad.jpg', 'File:Sichuan shredded chicken salad.jpg', 'Coolli22', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['莴笋叶煎饼', 'vegetable-pancakes.jpg', 'File:Egg and vegetable pancakes.jpg', 'Fumikas Sagisavas', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/']
]

for (const [title, fileName, imagePath, author, license, licenseUrl] of additionalExternalRecipeImages) {
  externalRecipeImages.set(title, {
    assetPath: path.join(projectRoot, 'scripts/assets', fileName),
    name: 'Wikimedia Commons',
    imagePath,
    author,
    license,
    licenseUrl,
    url: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(imagePath.slice(5))}`,
    modifications: 'resized and re-encoded as JPEG'
  })
}
const manualImageCrops = new Map([
  ['白灼虾', [0.40, 0.08, 0.58, 0.84]],
  ['葱烧海参', [0.08, 0.24, 0.84, 0.64]],
  ['黄油煎虾', [0.03, 0.15, 0.62, 0.82]],
  ['干煎阿根廷红虾', [0.12, 0.25, 0.72, 0.68]],
  ['芥末黄油罗氏虾', [0.03, 0.33, 0.94, 0.53]],
  ['蒜香黄油虾', [0.02, 0.22, 0.96, 0.75]],
  ['豉汁蒸白鱔', [0.02, 0.05, 0.93, 0.88]],
  ['豆豉鲮鱼油麦菜', [0.12, 0.13, 0.84, 0.78]],
  ['黑椒牛柳', [0.35, 0.44, 0.62, 0.54]],
  ['芥末罗氏虾', [0.04, 0.05, 0.92, 0.90]],
  ['咖喱肥牛', [0.37, 0.47, 0.60, 0.34]],
  ['口水鸡', [0.02, 0.02, 0.86, 0.96]],
  ['老妈蹄花', [0.08, 0.33, 0.84, 0.63]],
  ['黔式腊肠娃娃菜', [0.03, 0.05, 0.65, 0.83]],
  ['无骨鸡爪', [0.04, 0.10, 0.92, 0.85]],
  ['香辣鸡爪煲', [0.08, 0.04, 0.84, 0.58]],
  ['尖叫牛蛙', [0, 0.12, 1, 0.64]],
  ['酱牛肉', [0.05, 0.15, 0.75, 0.72]],
  ['河南蒸面条', [0.14, 0.23, 0.72, 0.53]],
  ['煮锅蒸米饭', [0.20, 0.18, 0.60, 0.64]],
  ['炒方便面', [0.51, 0.54, 0.37, 0.40]],
  ['地三鲜', [0.25, 0.12, 0.62, 0.52]],
  ['虎皮青椒', [0.18, 0.12, 0.64, 0.76]],
  ['上汤娃娃菜', [0.02, 0.03, 0.96, 0.94]],
  ['糖醋鲤鱼', [0.04, 0.08, 0.92, 0.82]],
  ['香煎翘嘴鱼', [0.06, 0.02, 0.65, 0.96]],
  ['阳朔啤酒鱼', [0.02, 0.15, 0.94, 0.78]],
  ['昂刺鱼豆腐汤', [0.05, 0.23, 0.90, 0.73]],
  ['菌菇炖乳鸽', [0.17, 0.07, 0.68, 0.80]],
  ['干锅花菜', [0.12, 0.08, 0.80, 0.85]],
  ['蚝油三鲜菇', [0.05, 0.08, 0.88, 0.82]],
  ['烤茄子', [0.04, 0.14, 0.92, 0.82]],
  ['蒜蓉空心菜', [0.06, 0.18, 0.90, 0.76]],
  ['淄博烧烤', [0.12, 0.02, 0.86, 0.96]],
  ['蒜蓉炒芹菜', [0.06, 0.02, 0.88, 0.96]],
  ['土豆炖排骨', [0.18, 0.04, 0.64, 0.88]],
  ['皮蛋瘦肉粥', [0.02, 0.20, 0.84, 0.78]],
  ['炸酱面', [0.05, 0.24, 0.92, 0.70]],
  ['红烧鱼', [0.08, 0.08, 0.84, 0.84]],
  ['水煮鱼', [0.10, 0.05, 0.80, 0.90]],
  ['可乐鸡翅', [0, 0.05, 1, 0.90]],
  ['辣椒炒肉', [0.02, 0.46, 0.70, 0.53]],
  ['糖醋里脊', [0.02, 0.12, 0.96, 0.82]],
  ['麻辣香锅', [0.03, 0.12, 0.92, 0.72]],
  ['孜然牛肉', [0.15, 0.02, 0.76, 0.94]],
  ['水煮肉片', [0.04, 0.05, 0.92, 0.90]],
  ['腊八粥', [0.05, 0.08, 0.70, 0.84]],
  ['生汆丸子汤', [0.18, 0.08, 0.65, 0.85]],
  ['葱油拌面', [0, 0.16, 0.78, 0.84]],
  ['手工水饺', [0.08, 0.05, 0.84, 0.90]],
  ['鲜肉烧卖', [0.10, 0.05, 0.80, 0.90]],
  ['扬州炒饭', [0.12, 0.29, 0.60, 0.66]],
  ['猪油拌饭', [0.36, 0.04, 0.60, 0.90]],
  ['红烧茄子', [0.18, 0.02, 0.66, 0.96]],
  ['皮蛋豆腐', [0.10, 0.05, 0.80, 0.90]],
  ['酸辣土豆丝', [0.10, 0.10, 0.76, 0.82]],
  ['蒜蓉西兰花', [0.06, 0.06, 0.90, 0.88]],
  ['西红柿炒鸡蛋', [0.05, 0.05, 0.90, 0.90]],
  ['茶叶蛋', [0.20, 0.05, 0.60, 0.90]],
  ['水煮玉米', [0.05, 0.05, 0.90, 0.90]],
  ['牛奶燕麦', [0.05, 0.10, 0.75, 0.80]],
  ['手抓饼', [0.05, 0.05, 0.90, 0.90]],
  ['煎饺', [0.03, 0.05, 0.94, 0.92]],
  ['红烧猪蹄', [0.05, 0.05, 0.90, 0.90]],
  ['羊肉汤', [0.14, 0.05, 0.64, 0.90]],
  ['炒滑蛋', [0.05, 0.18, 0.90, 0.70]],
  ['蛋炒饭', [0.18, 0.08, 0.64, 0.82]],
  ['凉拌鸡丝', [0.03, 0.20, 0.94, 0.72]],
  ['莴笋叶煎饼', [0.05, 0.05, 0.90, 0.90]],
  ['小炒藕丁', [0.14, 0.08, 0.72, 0.78]]
])

for (const [title] of additionalExternalRecipeImages) {
  externalRecipeImages.get(title).modifications = manualImageCrops.has(title)
    ? 'focus-cropped to the dish, resized, and re-encoded as JPEG'
    : 'resized and re-encoded as JPEG'
}

const manuallyExcludedRecipes = new Map([
  ['湘祁米夫鸭', '成品图构图未通过审核，且暂无准确的可授权替代图'],
  ['血浆鸭', '成品图过暗，且暂无准确的可授权替代图'],
  ['香菇滑鸡', '成品图清晰度未通过审核，且暂无准确的可授权替代图'],
  ['西红柿土豆炖牛肉', '成品图构图未通过审核，且暂无准确的可授权替代图'],
  ['陈皮排骨汤', '成品图构图未通过审核，且暂无准确的可授权替代图'],
  ['勾芡香菇汤', '成品图清晰度未通过审核，且暂无准确的可授权替代图'],
  ['朱雀汤', '成品图观感未通过审核，且暂无准确的可授权替代图'],
  ['微波炉鸡蛋羹', '与鸡蛋羹重复度高，且成品图与常见鸡蛋羹外观不符'],
  ['椒盐玉米', '成品图清晰度与构图未通过审核，且暂无准确的可授权替代图'],
  ['西红柿豆腐汤羹', '成品图严重模糊，且暂无准确的可授权替代图'],
  ['红烧冬瓜', '成品图清晰度未通过审核，且暂无准确的可授权替代图'],
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
  ['葱油桂鱼', {
    replaceIngredients: ['桂鱼', '小葱', '小米辣（可选）', '姜', '料酒', '植物油', '盐', '蒸鱼豉油', '清水'],
    replacePreparation: [
      '桂鱼 1条（约500g，已去鳞和内脏）',
      '小葱 1根（约30cm）',
      '小米辣 2个（可选）',
      '姜 30g',
      '料酒 25ml',
      '植物油 15ml',
      '盐 4g',
      '蒸鱼豉油 10ml',
      '清水 足量（蒸锅用）'
    ],
    replaceSteps: [
      '将桂鱼表面的余鳞刮净，去除鱼腹内的黑膜和贴骨血，用流动清水冲洗后以厨房纸吸干。',
      '鱼身两面各划 2-3 刀。姜切片，小葱切段，小米辣切圈。',
      '在鱼身内外均匀抹上盐和料酒，刀口及鱼腹放入一半姜片，冷藏腌制 10 分钟。',
      '蒸锅加入足量清水并烧开。倒掉鱼盘中的腌制液，取出旧姜片，重新放入剩余姜片。',
      '水开后放入鱼盘，保持中大火蒸 8-10 分钟；鱼身较厚时适当延长，确保最厚处完全变白并能轻松剥离鱼骨。',
      '关火焖 2 分钟后取出鱼盘，倒掉盘中腥水并夹去姜片，淋上蒸鱼豉油，铺上小葱和小米辣。',
      '植物油用中火加热至表面微微流动但不冒烟，关火后均匀淋在葱段上即可。'
    ],
    cookingTime: '35分钟'
  }],
  ['西红柿鸡蛋挂面', {
    replaceIngredients: ['挂面', '西红柿', '鸡蛋', '小葱', '青椒（可选）', '食用油', '盐', '生抽', '蚝油或鸡精', '白砂糖（可选）', '香油（可选）', '清水'],
    replacePreparation: [
      '挂面 80g',
      '西红柿 1个（约200g）',
      '鸡蛋 2个',
      '小葱 1根（约5g）',
      '青椒 半个（约50g，可选）',
      '食用油 20ml',
      '盐 3g',
      '生抽 5ml',
      '蚝油 5g或鸡精 1g',
      '白砂糖 2g（西红柿较酸时使用）',
      '香油 2ml（可选）',
      '清水 700ml'
    ],
    replaceSteps: [
      '小葱切葱花，西红柿切小块；使用青椒时去蒂去籽后切小块。',
      '鸡蛋打入碗中充分搅散。',
      '炒锅中火加热，倒入 15ml 食用油；油面微微流动时倒入蛋液，快速划散，刚凝固便盛出。',
      '锅中加入剩余食用油和葱白炒香，放入西红柿和青椒翻炒至西红柿出汁。',
      '加入生抽、白砂糖和约 100ml 清水，煮开后放回鸡蛋，加蚝油或鸡精，转中小火煮 2-3 分钟，最后加香油和葱绿。',
      '另起锅加入约 600ml 清水，煮沸后下挂面，按包装标示时间煮至面条无白芯。',
      '面条沥水后盛入碗中，浇上西红柿鸡蛋臊子即可。'
    ],
    cookingTime: '20分钟'
  }],
  ['青椒土豆炒肉', {
    replaceIngredients: ['青椒', '土豆', '猪肉', '葱', '姜', '蒜', '盐', '生抽', '食用油', '土豆淀粉', '清水'],
    replacePreparation: [
      '青椒 2个（共约200g）',
      '土豆 2个（共约300g）',
      '猪肉 200g',
      '葱 1根（约10g）',
      '姜 1块（约5g）',
      '蒜 3瓣（约12g）',
      '盐 4g',
      '生抽 8ml',
      '食用油 15ml',
      '土豆淀粉 5g',
      '清水 15ml'
    ],
    replaceSteps: [
      '青椒去蒂去籽切块；土豆去皮切约 2mm 薄片，清水冲去表面淀粉后沥干；猪肉切约 4mm 薄片，葱姜蒜切末。',
      '土豆淀粉加入 15ml 清水调成水淀粉。',
      '炒锅中火加热，倒入食用油；油面微微流动后放入肉片，炒至完全变色，再加入 3ml 生抽和 1g 盐翻匀。',
      '加入葱姜蒜炒香，放入土豆片，转中大火翻炒 3-5 分钟；加入剩余生抽和 2g 盐，炒至土豆断生且边缘微黄。',
      '加入青椒大火翻炒约 1 分钟，青椒颜色变亮后沿锅边淋入水淀粉，翻匀并煮至芡汁透明。',
      '尝味后用剩余盐调整，确认猪肉熟透、土豆无生硬口感后关火装盘。'
    ],
    cookingTime: '30分钟'
  }],
  ['土豆炖排骨', {
    addIngredients: ['青椒（可选）'],
    addPreparation: ['青椒 1个（约100g，可选）'],
    replaceSteps: [
      '土豆去皮切滚刀块，浸入清水防止氧化；姜切片，15g 小葱打结，剩余小葱切葱花。',
      '将生抽、老抽、蚝油和黄豆酱在小碗中混合；干辣椒、八角、花椒、桂皮和 15g 姜片放在另一小碟备用。',
      '排骨冷水下锅，加入葱结、剩余姜片和 15ml 料酒。煮沸后继续焯 2 分钟，捞出洗净浮沫并充分沥干。',
      '炒锅加入食用油，中火将排骨煎至表面微黄；转中小火加入白糖，翻炒至糖溶化并均匀裹在排骨表面，避免将糖烧黑。',
      '加入香料炒约 10 秒，沿锅边淋入剩余料酒，再倒入调好的酱汁翻炒 30 秒。',
      '加入 700ml 开水并烧开，盖锅盖转小火炖 40 分钟。',
      '土豆沥干后放入锅中，继续加盖小火炖 15-20 分钟，直至土豆能被筷子轻松扎透。使用青椒时，将其切块并在收汁前 2 分钟放入。',
      '加入盐调味，转大火收汁 3-5 分钟；汤汁浓稠后关火，撒葱花即可。'
    ],
    cookingTime: '90分钟'
  }],
  ['西红柿鸡蛋汤', {
    replaceIngredients: ['西红柿', '鸡蛋', '小葱', '姜', '蒜', '食用油', '盐', '香油', '味精（可选）', '清水'],
    replacePreparation: [
      '西红柿 1个（约200g）',
      '鸡蛋 2个',
      '小葱 1根（约5g）',
      '姜 3g',
      '蒜 1瓣（约5g）',
      '食用油 10ml',
      '盐 3g',
      '香油 2ml',
      '味精 0.5g（可选）',
      '清水 600ml'
    ],
    replaceSteps: [
      '西红柿洗净切小块，小葱切葱花，姜和蒜切末。',
      '鸡蛋打入碗中，充分搅散。',
      '锅中火加热后倒入食用油，放入姜蒜末和葱白炒约 20 秒。',
      '加入西红柿翻炒 1-2 分钟，至边缘变软并析出汁水。',
      '倒入 600ml 清水并煮沸，加入盐。',
      '保持汤面微沸，将蛋液细细淋入锅中，停 10 秒后用汤勺轻推形成蛋花。',
      '再煮 30 秒后关火，加入味精和香油，撒葱绿即可。'
    ],
    cookingTime: '15分钟'
  }],
  ['皮蛋瘦肉粥', {
    replaceIngredients: ['大米', '瘦肉', '皮蛋', '生姜', '小葱', '香菜（可选）', '生菜（可选）', '生抽', '蚝油', '盐', '白胡椒粉', '食用油', '清水'],
    replacePreparation: [
      '大米 120g',
      '清水 1L',
      '瘦肉 100g',
      '皮蛋 2个',
      '生姜 10g',
      '小葱 1根（约5g）',
      '香菜 1根（约5g，可选）',
      '生菜 4片（约80g，可选）',
      '生抽 5ml',
      '蚝油 5ml',
      '盐 2g',
      '白胡椒粉 1g',
      '食用油 10ml'
    ],
    replaceSteps: [
      '大米淘洗干净，与 1L 清水放入电饭锅，选择煮粥模式；用普通锅时，煮开后转小火并不时搅拌，煮 45-60 分钟至米粒开花。',
      '瘦肉切细丝，加入生抽、蚝油和食用油抓匀，盖好后冷藏腌制 10 分钟。',
      '皮蛋去壳切小块，生姜切细丝；小葱、香菜和生菜洗净切碎。',
      '粥底煮至黏稠并保持沸腾后，放入肉丝并迅速搅散，继续煮 5-8 分钟，确保肉丝完全变色熟透。',
      '加入皮蛋和姜丝，再煮 3 分钟，用盐和白胡椒粉调味。',
      '使用生菜时先放入粥中煮至变软；关火后撒小葱和香菜即可。'
    ],
    cookingTime: '75分钟'
  }],
  ['小米粥', {
    replaceIngredients: ['小米', '清水'],
    replacePreparation: [
      '小米 100g',
      '清水 1200ml（喜欢稀粥可增加至1500ml）'
    ],
    replaceSteps: [
      '小米放入碗中，用清水轻轻淘洗 1-2 次，不要用力搓洗，沥干备用。',
      '锅中加入清水并大火烧开，再倒入小米，立即搅拌防止粘底。',
      '重新煮开后保持中大火 5 分钟，期间搅拌 1-2 次并注意防止溢锅。',
      '转小火煮 20-25 分钟，锅盖留一条缝，并每隔几分钟搅拌一次。',
      '米粒开花、粥体黏稠后关火，静置 5 分钟即可。'
    ],
    cookingTime: '35分钟'
  }],
  ['蛋炒饭', {
    replaceIngredients: ['冷米饭', '鸡蛋', '火腿肠', '胡萝卜（可选）', '黄瓜（可选）', '小葱', '食用油', '盐', '白胡椒粉', '生抽'],
    replacePreparation: [
      '冷米饭 500ml（约350g）',
      '鸡蛋 2个',
      '火腿肠 2根（约80g）',
      '胡萝卜 30g（可选）',
      '黄瓜 30g（可选）',
      '小葱 1根（约5g）',
      '食用油 15ml',
      '盐 3g',
      '白胡椒粉 0.5g',
      '生抽 5ml'
    ],
    replaceSteps: [
      '冷米饭提前用饭勺拨散；火腿肠、胡萝卜和黄瓜切小丁，小葱切葱花。',
      '鸡蛋打入碗中搅散。',
      '炒锅中火加热，倒入一半食用油；油面微微流动后倒入蛋液，快速炒至刚凝固，盛出备用。',
      '锅中加入剩余食用油，放入火腿肠和胡萝卜，中大火翻炒约 1 分钟。',
      '加入冷米饭，边炒边压散饭团，持续翻炒至米饭热透、颗粒分明。',
      '加入生抽、盐和白胡椒粉翻匀，再放回鸡蛋，加入黄瓜丁和葱花翻炒 30 秒。',
      '确认鸡蛋熟透、米饭热透后关火装盘。'
    ],
    cookingTime: '25分钟'
  }],
  ['炸酱面', {
    replaceIngredients: ['猪肉末', '面条', '黄瓜等菜码', '小葱', '蒜', '黄豆酱或不辣豆瓣酱', '甜面酱', '食用油', '清水'],
    replacePreparation: [
      '猪肉末 150g',
      '挂面 150g或鲜面条 250g',
      '黄瓜等菜码 100g',
      '小葱 15g',
      '蒜 1瓣（约5g）',
      '黄豆酱或不辣豆瓣酱 20g',
      '甜面酱 20g',
      '食用油 10ml',
      '清水 50ml（炒酱用）'
    ],
    replaceSteps: [
      '黄瓜等菜码洗净切细丝，小葱和蒜切末。',
      '炒锅中火加热后倒入食用油，放入猪肉末炒散，直至完全变色且没有粉红色。',
      '加入葱蒜末炒香，转小火放入黄豆酱和甜面酱，翻炒 1-2 分钟。',
      '加入 50ml 清水搅匀，小火煮 3-5 分钟至酱汁浓稠，期间勤翻动避免糊底。',
      '另起锅将水烧开，下入面条，按包装标示时间煮至无白芯。',
      '面条捞出沥水；喜欢凉面口感时可过一次凉开水，再充分沥干。',
      '面条盛入碗中，放上炸酱和菜码，食用前拌匀。'
    ],
    cookingTime: '30分钟'
  }],
  ['热干面', {
    replaceIngredients: ['碱水面', '小葱', '酸豆角', '萝卜干', '芝麻酱', '蒜水', '生抽', '辣椒油（可选）', '白胡椒粉', '盐', '鸡精（可选）', '熟肉末（可选）', '肉汤（可选）', '温水'],
    replacePreparation: [
      '碱水面 250g',
      '小葱 10g',
      '酸豆角 20g',
      '萝卜干 20g',
      '芝麻酱 30g',
      '温水 45ml（调芝麻酱用）',
      '蒜水 15ml',
      '生抽 5ml',
      '辣椒油 0-10ml',
      '白胡椒粉 0.5g',
      '盐 1g',
      '鸡精 0.5g（可选）',
      '熟肉末 30g（可选）',
      '肉汤 30ml（可选）'
    ],
    replaceSteps: [
      '小葱切葱花，酸豆角和萝卜干切碎；芝麻酱分次加入 45ml 温水，搅拌至顺滑且能够流动。',
      '锅中水烧开后下碱水面，按包装标示时间煮至熟透；鲜碱水面通常需要 1-3 分钟，不要只按固定秒数判断。',
      '面条捞出并充分沥水，趁热放入大碗。',
      '加入调好的芝麻酱、蒜水、生抽、白胡椒粉和盐；使用鸡精、肉汤或辣椒油时一并加入，迅速拌匀。',
      '放上酸豆角、萝卜干、葱花和熟肉末，拌匀即可。'
    ],
    cookingTime: '15分钟'
  }],
  ['红烧鱼', {
    replaceIngredients: ['鱼', '姜', '蒜', '小葱', '干辣椒（可选）', '食用油', '盐', '料酒', '生抽', '老抽', '陈醋', '白砂糖', '清水'],
    replacePreparation: [
      '鱼 1条（约600-800g，已去鳞、鳃和内脏）',
      '姜 15g',
      '蒜 4瓣（约16g）',
      '小葱 2根（约10g）',
      '干辣椒 2个（可选）',
      '食用油 30ml',
      '盐 4g',
      '料酒 20ml',
      '生抽 15ml',
      '老抽 3ml',
      '陈醋 5ml',
      '白砂糖 6g',
      '清水 400ml'
    ],
    replaceSteps: [
      '鱼腹内的黑膜和贴骨血清理干净，用流动清水冲洗后以厨房纸吸干；鱼身两面各划 2-3 刀。',
      '姜切片，蒜拍碎，小葱切段，干辣椒切段。生抽、老抽、陈醋和白砂糖混合成料汁。',
      '鱼身内外抹 2g 盐和一半料酒，冷藏腌制 10 分钟；取出后再次吸干表面水分。',
      '炒锅中火加热后倒入食用油，放入鱼，先不要翻动；煎 2-3 分钟至定型后翻面，再煎 2 分钟。',
      '将鱼拨到一侧，放入姜、蒜、葱白和干辣椒炒香，沿锅边淋入剩余料酒和调好的料汁。',
      '加入 400ml 热水，烧开后盖锅盖转中小火烧 12-15 分钟；中途将汤汁淋在鱼身上，不必反复翻鱼。',
      '加入剩余盐调味，确认鱼肉最厚处完全变白且能轻松剥离鱼骨后，转大火收汁 2-3 分钟，撒葱绿即可。'
    ],
    cookingTime: '45分钟'
  }],
  ['清蒸生蚝', {
    replaceIngredients: ['生蚝', '蒜', '姜', '小葱', '生抽', '清水'],
    replacePreparation: [
      '带壳生蚝 6个',
      '蒜 6瓣（约24g）',
      '姜 6片（约12g）',
      '小葱 1根（约5g）',
      '生抽 6ml',
      '清水 1L（蒸锅用）'
    ],
    replaceSteps: [
      '生蚝外壳用硬毛刷在流动水下刷净；丢弃外壳破裂，或轻敲后仍不闭合的生蚝。蒜切末，小葱切葱花。',
      '蒸锅加入清水并烧开，生蚝凸面朝下平铺在蒸屉上，盖锅盖蒸 5 分钟。',
      '戴隔热手套，身体避开蒸汽方向打开锅盖；丢弃仍完全闭合的生蚝，其余生蚝去掉上壳。',
      '每个蚝肉放 1 片姜，并均匀分配蒜末；盖锅盖继续蒸 2-3 分钟，直至蚝肉完全变得饱满不透明。',
      '关火后每个生蚝淋约 1ml 生抽，撒葱花，趁热食用。'
    ],
    cookingTime: '25分钟'
  }],
  ['水煮鱼', {
    replaceIngredients: ['巴沙鱼柳', '蔬菜', '红油豆瓣酱', '干辣椒', '花椒', '姜', '蒜', '鸡蛋清', '土豆淀粉', '菜籽油', '盐', '白砂糖', '白胡椒粉', '清水'],
    replacePreparation: [
      '巴沙鱼柳 500g',
      '豆芽、生菜或花菜等蔬菜 共400g',
      '红油豆瓣酱 25g',
      '干辣椒 8g（按口味调整）',
      '花椒 3g（按口味调整）',
      '姜 10g',
      '蒜 5瓣（约20g）',
      '鸡蛋清 1个',
      '土豆淀粉 10g',
      '菜籽油 40ml',
      '盐 4g',
      '白砂糖 2g',
      '白胡椒粉 1g',
      '清水 700ml'
    ],
    replaceSteps: [
      '冷冻鱼柳提前一晚移入冷藏室解冻；需要快速解冻时密封后浸入冷水并每 30 分钟换水，不要放在室温下长时间解冻。',
      '鱼柳吸干水分后斜切约 4mm 厚的片，加入 2g 盐、白胡椒粉、鸡蛋清和土豆淀粉，轻轻抓匀后冷藏腌制 15 分钟。',
      '蔬菜洗净切成易熟的小块；姜切末，蒜切末，干辣椒剪段。',
      '锅中烧开适量水，将蔬菜分别焯至熟透，充分沥水后铺在大碗底部。',
      '炒锅加入 25ml 菜籽油，中小火炒香姜末、一半蒜末和豆瓣酱，加入 700ml 清水、白砂糖和剩余盐，煮沸 3 分钟。',
      '转小火，将鱼片逐片放入汤中；全部放完后转中火，轻推使其散开，煮至鱼片完全变白且中心熟透，约 2-3 分钟。',
      '鱼片和汤倒在蔬菜上，表面放剩余蒜末、干辣椒和花椒。',
      '剩余菜籽油加热至微微流动后关火，小心淋在香料上即可。'
    ],
    cookingTime: '45分钟',
    advanceTime: '冷冻鱼柳建议提前一晚转入冷藏室解冻'
  }],
  ['黄焖鸡', {
    replaceIngredients: ['鸡腿', '干香菇', '青椒', '土豆（可选）', '姜', '干辣椒（可选）', '食用油', '白砂糖', '料酒', '生抽', '老抽', '盐', '白胡椒粉', '清水'],
    replacePreparation: [
      '鸡腿 2只（带骨约600g）',
      '干香菇 5朵（约20g）',
      '青椒 2个（约180g）',
      '土豆 1个（约200g，可选）',
      '姜 10g',
      '干辣椒 2个（可选）',
      '食用油 15ml',
      '白砂糖 5g',
      '料酒 15ml',
      '生抽 15ml',
      '老抽 3ml',
      '盐 3g',
      '白胡椒粉 0.5g',
      '清水 500ml'
    ],
    replaceSteps: [
      '干香菇洗去浮尘，用温水泡软后切片，泡香菇的水静置备用；鸡腿剁成约 4cm 的块并用厨房纸吸干。',
      '青椒去蒂去籽切块，姜切片；使用土豆时去皮切滚刀块。',
      '炒锅中火加热后倒入食用油和白砂糖，小火搅拌至糖溶化并呈浅琥珀色；不熟悉炒糖色可跳过此步，直接用油煎鸡块。',
      '放入鸡块转中大火翻炒至表面变色微黄，加入姜片、干辣椒和料酒炒香。',
      '加入生抽和老抽翻匀，再放入香菇、土豆、白胡椒粉和盐。',
      '倒入过滤后的香菇水并补清水至共约 500ml，烧开后盖锅盖转小火焖 20-25 分钟。',
      '确认鸡肉中心完全熟透、土豆能被筷子轻松扎透后，开盖收汁；放入青椒翻炒 1-2 分钟即可。'
    ],
    cookingTime: '50分钟',
    advanceTime: '干香菇需提前浸泡约 30 分钟'
  }],
  ['可乐鸡翅', {
    replaceIngredients: ['鸡翅中', '可乐', '姜', '小葱', '食用油', '料酒', '生抽', '老抽', '盐'],
    replacePreparation: [
      '鸡翅中 10只（约500g）',
      '可乐 330ml',
      '姜 10g',
      '小葱 2根（约10g）',
      '食用油 10ml',
      '料酒 15ml',
      '生抽 15ml',
      '老抽 3ml',
      '盐 1g'
    ],
    replaceSteps: [
      '鸡翅用厨房纸吸干，两面各划 2 刀；加入料酒和 10ml 生抽，盖好后冷藏腌制 15 分钟。',
      '姜切片，小葱打结。鸡翅取出后沥去多余腌汁。',
      '炒锅中火加热，倒入食用油，放入姜片和鸡翅；每面煎约 2-3 分钟，至表面金黄。',
      '倒入可乐，加入葱结、剩余生抽、老抽和盐，烧开后撇去浮沫。',
      '转中小火加盖煮 15 分钟，中途翻动一次。',
      '取出葱结和姜片，确认鸡翅最厚处已完全熟透，再转中火收汁并频繁翻动。',
      '酱汁浓稠并均匀裹住鸡翅后立即关火，避免糖分烧焦发苦。'
    ],
    cookingTime: '40分钟'
  }],
  ['辣椒炒肉', {
    replaceIngredients: ['猪瘦肉', '青椒', '蒜', '姜', '豆豉（可选）', '食用油', '盐', '生抽', '蚝油'],
    replacePreparation: [
      '猪瘦肉 200g',
      '青椒或螺丝椒 250g',
      '蒜 3瓣（约12g）',
      '姜 5g',
      '豆豉 5g（可选）',
      '食用油 15ml',
      '盐 3g',
      '生抽 5ml',
      '蚝油 5g'
    ],
    replaceSteps: [
      '青椒去蒂后斜切片；蒜切片，姜切末。',
      '猪肉逆着纹理切薄片，加入生抽、蚝油和 1g 盐抓匀，冷藏腌制 10 分钟。',
      '炒锅烧热，不放油，放入青椒和 1g 盐，中火干煸 2-3 分钟，至表面出现焦斑后盛出。',
      '锅中倒入食用油，放入蒜、姜和豆豉炒香。',
      '加入肉片，中大火迅速炒散，直至肉片完全变色且中心熟透。',
      '放回青椒，加入剩余盐，大火翻炒约 1 分钟即可。'
    ],
    cookingTime: '25分钟'
  }],
  ['糖醋里脊', {
    replaceIngredients: ['猪里脊', '鸡蛋', '玉米淀粉', '食用油', '盐', '白胡椒粉', '料酒', '生抽', '番茄酱', '白砂糖', '米醋', '清水'],
    replacePreparation: [
      '猪里脊 400g',
      '鸡蛋 1个',
      '玉米淀粉 80g',
      '食用油 约600ml（炸制后大部分会剩余）',
      '盐 3g',
      '白胡椒粉 1g',
      '料酒 10ml',
      '生抽 5ml',
      '番茄酱 50g',
      '白砂糖 25g',
      '米醋 20ml',
      '清水 60ml'
    ],
    replaceSteps: [
      '猪里脊切成约 1cm 粗、5cm 长的肉条，加入盐、白胡椒粉、料酒和生抽抓匀，冷藏腌制 15 分钟。',
      '鸡蛋打散后拌入肉条，再加入 70g 玉米淀粉，使每根肉条均匀挂糊；剩余淀粉与清水调匀。',
      '番茄酱、白砂糖、米醋和水淀粉混合成糖醋汁。',
      '炸锅倒入食用油，加热至约 160°C；肉条逐根下锅，分批炸 3-4 分钟，至表面浅黄且肉心熟透后捞出。',
      '油温升至约 185°C，将肉条复炸 20-30 秒至表面金黄酥脆，立即捞出沥油。',
      '另取炒锅，倒入糖醋汁，中小火不断搅拌至冒泡并变得浓稠。',
      '关火后放入炸好的里脊，快速翻匀使其裹满酱汁，立即装盘。'
    ],
    cookingTime: '50分钟',
    advanceTime: '里脊需冷藏腌制 15 分钟'
  }],
  ['麻辣香锅', {
    replaceIngredients: ['肉类或虾', '豆制品', '耐煮蔬菜', '叶菜', '麻辣香锅调料', '姜', '蒜', '干辣椒', '食用油', '生抽', '白砂糖'],
    replacePreparation: [
      '鸡肉、猪肉或鲜虾 共300g',
      '豆腐干或腐竹 100g',
      '土豆、藕、花菜或菌菇等耐煮蔬菜 共350g',
      '油麦菜、生菜等叶菜 共150g',
      '麻辣香锅调料 60g',
      '姜 10g',
      '蒜 5瓣（约20g）',
      '干辣椒 8g（按口味调整）',
      '食用油 35ml',
      '生抽 10ml',
      '白砂糖 3g'
    ],
    replaceSteps: [
      '所有食材分别洗净；肉类切薄片，虾去虾线；豆制品和蔬菜切成大小接近、适合入口的块。姜切片，蒜拍碎。',
      '锅中烧开水，先将土豆、藕、花菜等耐煮蔬菜焯至八成熟，再将叶菜快速焯至断生，分别捞出并充分沥水。',
      '肉类或虾另行焯熟或炒熟：肉片中心不得有粉红色，虾应整体变色卷曲。',
      '炒锅擦干后倒入食用油，中小火放入姜、蒜和干辣椒炒香。',
      '加入麻辣香锅调料，小火翻炒约 1 分钟，避免炒糊。',
      '先放耐煮蔬菜、豆制品和肉类，大火翻炒 2 分钟；再放叶菜、生抽和白砂糖翻炒均匀。',
      '确认全部食材热透后关火装盘；成品调料通常含盐，不再额外加盐，尝味后再决定是否补充。'
    ],
    cookingTime: '35分钟'
  }],
  ['孜然牛肉', {
    replaceIngredients: ['牛里脊或牛肩肉', '青椒', '洋葱', '小米椒（可选）', '孜然粒', '小葱', '生抽', '料酒', '玉米淀粉', '食用油', '盐'],
    replacePreparation: [
      '牛里脊或牛肩肉 300g',
      '青椒 2个（约160g）',
      '洋葱 半个（约100g）',
      '小米椒 2个（可选）',
      '孜然粒 8g',
      '小葱 2根（约10g）',
      '生抽 10ml',
      '料酒 10ml',
      '玉米淀粉 8g',
      '食用油 20ml',
      '盐 2g'
    ],
    replaceSteps: [
      '牛肉逆着纹理切约 3mm 薄片；青椒和洋葱切丝，小米椒切圈，小葱切段。',
      '牛肉加入生抽、料酒、玉米淀粉和 5ml 食用油抓匀，冷藏腌制 15 分钟。',
      '孜然粒用擀面杖轻轻压碎，保留部分颗粒。',
      '炒锅中大火加热，倒入剩余食用油；放入牛肉迅速摊开，翻炒至刚变色后盛出。',
      '锅中放入洋葱、青椒、小米椒和葱白，大火翻炒 1-2 分钟至断生。',
      '放回牛肉，加入孜然和盐，大火翻炒约 30 秒；确认牛肉熟透后立即关火，撒葱绿即可。'
    ],
    cookingTime: '30分钟',
    advanceTime: '牛肉需冷藏腌制 15 分钟'
  }],
  ['水煮肉片', {
    replaceIngredients: ['猪里脊', '豆芽', '莴笋叶或油麦菜', '红油豆瓣酱', '干辣椒', '花椒', '姜', '蒜', '小葱', '鸡蛋清', '土豆淀粉', '生抽', '料酒', '食用油', '盐', '白砂糖', '白胡椒粉', '清水'],
    replacePreparation: [
      '猪里脊 300g',
      '绿豆芽 200g',
      '莴笋叶或油麦菜 200g',
      '红油豆瓣酱 25g',
      '干辣椒 10g（按口味调整）',
      '花椒 3g（按口味调整）',
      '姜 10g',
      '蒜 5瓣（约20g）',
      '小葱 2根（约10g）',
      '鸡蛋清 1个',
      '土豆淀粉 12g',
      '生抽 10ml',
      '料酒 10ml',
      '食用油 60ml',
      '盐 4g',
      '白砂糖 2g',
      '白胡椒粉 1g',
      '清水 700ml'
    ],
    replaceSteps: [
      '猪里脊逆着纹理切约 2mm 薄片，加入生抽、料酒、1g 盐、白胡椒粉、鸡蛋清和土豆淀粉，顺一个方向抓匀，冷藏腌制 15 分钟。',
      '豆芽和叶菜洗净沥水；姜、蒜切末，小葱切葱花，干辣椒剪段。',
      '炒锅加入 15ml 食用油，先炒豆芽 2 分钟，再加入叶菜和 1g 盐炒至断生，盛入大碗垫底。',
      '锅中加入 25ml 食用油，中小火炒香姜末、一半蒜末和豆瓣酱，倒入清水，加入白砂糖和剩余盐，煮沸 3 分钟。',
      '转小火，将肉片逐片放入汤中；全部放完后转中火轻推散开，煮至肉片完全变色、中心熟透，约 2-3 分钟。',
      '将肉片和适量汤汁倒在蔬菜上，表面撒剩余蒜末、葱花、干辣椒和花椒。',
      '剩余食用油加热至微微流动后关火，小心淋在香料上即可。'
    ],
    cookingTime: '45分钟',
    advanceTime: '猪里脊需冷藏腌制 15 分钟',
    nutrition: { calories: '约1050大卡（整份）' }
  }],
  ['小酥肉', {
    replaceIngredients: ['去皮猪肉', '鸡蛋', '红薯淀粉', '面粉', '姜', '小葱', '花椒碎', '十三香', '白胡椒粉', '料酒', '生抽', '盐', '食用油', '清水'],
    replacePreparation: [
      '去皮猪肉 500g',
      '鸡蛋 2个',
      '红薯淀粉 120g',
      '面粉 30g',
      '姜 20g',
      '小葱 15g',
      '花椒碎 4g',
      '十三香 1g',
      '白胡椒粉 1g',
      '料酒 15ml',
      '生抽 8ml',
      '盐 4g',
      '食用油 约700ml（炸制后大部分会剩余）',
      '清水 80ml'
    ],
    replaceSteps: [
      '姜切丝，小葱切段，与清水和料酒一起抓揉 2 分钟，静置 5 分钟后滤出葱姜水。',
      '猪肉切成约 1cm 粗、6cm 长的条，加入盐、生抽、白胡椒粉、十三香和花椒碎抓匀。',
      '葱姜水分 2-3 次加入肉中，每次搅拌至吸收后再加；盖好后冷藏腌制 30 分钟。',
      '鸡蛋打散，加入红薯淀粉和面粉调成浓稠面糊，再与肉条充分拌匀。',
      '炸锅倒入食用油，加热至约 160°C；肉条逐根下锅并分批炸制，约 4-5 分钟，至表面浅黄且肉心熟透后捞出。',
      '油温升至约 185°C，将酥肉复炸 20-30 秒至金黄酥脆，立即捞出沥油。',
      '静置 2 分钟后掰开最粗的一条，确认中心没有粉红色再食用。'
    ],
    cookingTime: '70分钟',
    advanceTime: '猪肉需冷藏腌制 30 分钟'
  }],
  ['凉拌黄瓜', {
    replaceIngredients: ['黄瓜', '蒜', '白砂糖', '陈醋', '生抽', '盐', '香油', '蚝油（可选）'],
    replacePreparation: [
      '黄瓜 200g',
      '蒜 3瓣（约12g）',
      '白砂糖 5g',
      '陈醋 12ml',
      '生抽 7.5ml',
      '盐 0.6g',
      '香油 7ml',
      '蚝油 5ml（可选）'
    ],
    replaceSteps: [
      '黄瓜洗净，切下两端并尝一下确认没有明显苦味。',
      '用刀面将黄瓜轻轻拍裂，再切成约 3cm 长的小块，放入碗中。',
      '蒜拍碎后切成蒜末。',
      '黄瓜加入白砂糖拌匀，冷藏腌制 15 分钟。',
      '加入陈醋、生抽、盐、蒜末和蚝油，充分拌匀。',
      '最后淋入香油拌匀；现拌现吃，暂不食用时应密封冷藏并在 8 小时内食用。'
    ],
    cookingTime: '20分钟'
  }],
  ['腊八粥', {
    replaceIngredients: ['大米', '糯米', '黑米', '小米', '红豆', '花生', '莲子', '红枣', '桂圆干', '冰糖（可选）', '清水'],
    replacePreparation: [
      '大米 50g',
      '糯米 40g',
      '黑米 30g',
      '小米 30g',
      '红豆 30g',
      '花生 25g',
      '莲子 20g',
      '红枣 30g',
      '桂圆干 20g',
      '冰糖 0-30g',
      '清水 1600ml'
    ],
    replaceSteps: [
      '红豆、花生和莲子淘洗干净，加入足量清水，盖好后放入冰箱冷藏浸泡一晚。',
      '大米、糯米、黑米和小米轻轻淘洗 1-2 次；红枣洗净去核，桂圆干快速冲洗。',
      '泡好的豆类和莲子沥水，与 1600ml 清水放入锅中，大火煮开后转小火煮 30 分钟。',
      '加入全部米类，重新煮开后将锅盖留一条缝，小火煮 45-60 分钟；每隔 10 分钟从锅底搅动一次。',
      '加入红枣和桂圆干，再煮 15 分钟；粥过稠时少量补充热水。',
      '确认豆类和米粒完全软烂后，按口味加入冰糖，搅拌至溶化即可。'
    ],
    cookingTime: '120分钟',
    advanceTime: '红豆、花生和莲子需提前冷藏浸泡一晚',
    nutrition: { calories: '约1200大卡（整锅，约4份）' }
  }],
  ['紫菜蛋花汤', {
    replaceIngredients: ['干紫菜', '鸡蛋', '小葱', '虾皮（可选）', '盐', '香油', '清水'],
    replacePreparation: [
      '干紫菜 8g',
      '鸡蛋 2个',
      '小葱 1根（约5g）',
      '虾皮 5g（可选）',
      '盐 3g',
      '香油 2ml',
      '清水 700ml'
    ],
    replaceSteps: [
      '紫菜用清水快速漂洗并沥干；鸡蛋打散，小葱切葱花。',
      '锅中加入清水和虾皮，大火烧开。',
      '放入紫菜，用筷子拨散，重新煮开后加入盐。',
      '保持汤面微沸，将蛋液细细淋入锅中，停 10 秒后用汤勺轻推形成蛋花。',
      '再煮 30 秒后关火，淋入香油并撒葱花即可。'
    ],
    cookingTime: '15分钟'
  }],
  ['生汆丸子汤', {
    replaceIngredients: ['猪前腿肉', '鸡蛋清', '土豆淀粉', '小葱', '姜', '花椒', '干木耳', '粉丝', '青菜', '盐', '白胡椒粉', '香油', '清水'],
    replacePreparation: [
      '猪前腿肉 300g（肥瘦约3:7）',
      '鸡蛋清 1个',
      '土豆淀粉 15g',
      '小葱 2根（约10g）',
      '姜 10g',
      '花椒 1g',
      '干木耳 10g',
      '粉丝 50g',
      '青菜 100g',
      '盐 5g',
      '白胡椒粉 1g',
      '香油 2ml',
      '清水 900ml（其中100ml制作葱姜水）'
    ],
    replaceSteps: [
      '干木耳用冷水泡发约 45 分钟，去掉硬根并洗净；粉丝按包装说明泡软，青菜洗净。',
      '5g 小葱、姜和花椒加入 100ml 清水，抓揉后静置 10 分钟，滤出葱姜水；剩余小葱切葱花。',
      '猪肉剁成肉末，加入 3g 盐和白胡椒粉，顺一个方向搅拌。葱姜水分次加入，每次搅至吸收后再加。',
      '加入鸡蛋清和土豆淀粉，继续顺同一方向搅拌至肉馅黏稠上劲。',
      '锅中加入剩余清水和木耳，烧开后转小火，使汤面保持微沸。',
      '手蘸清水，将肉馅挤成直径约 3cm 的丸子，用勺子逐个放入锅中；全部下锅后转中火。',
      '丸子浮起后再煮 3-5 分钟，加入粉丝和青菜煮熟；切开最大的丸子，确认中心完全熟透。',
      '加入剩余盐调味，盛入碗中，淋香油并撒葱花即可。'
    ],
    cookingTime: '55分钟',
    advanceTime: '干木耳需提前用冷水泡发约 45 分钟'
  }],
  ['韭菜盒子', {
    replaceIngredients: ['中筋面粉', '韭菜', '鸡蛋', '虾仁', '食用油', '香油', '盐', '热水'],
    replacePreparation: [
      '中筋面粉 250g',
      '约80°C热水 150ml',
      '韭菜 300g',
      '鸡蛋 3个',
      '虾仁 100g',
      '食用油 25ml',
      '香油 10ml',
      '盐 4g'
    ],
    replaceSteps: [
      '面粉中分次倒入热水，边倒边用筷子搅成絮状；稍凉后揉成光滑面团，盖好醒面 30 分钟。',
      '韭菜洗净后彻底晾干并切碎；虾仁去虾线后切小丁。',
      '鸡蛋加入 1g 盐打散。炒锅放 10ml 食用油，中火炒成细小蛋块，盛出并完全放凉。',
      '韭菜先与香油拌匀，再加入鸡蛋、虾仁和剩余盐，包制前才混合均匀。',
      '面团搓长后分成 8 个剂子，逐个擀成直径约 15cm 的圆皮；放入馅料，对折并将边缘捏紧。',
      '平底锅加入剩余食用油，中小火放入韭菜盒子，每面煎 2-3 分钟至金黄。',
      '沿锅边加入 30ml 清水，立即盖锅盖焖 2-3 分钟；水分收干后再翻面 30 秒，确认虾仁和蛋馅热透后出锅。'
    ],
    cookingTime: '70分钟',
    advanceTime: '面团需醒面 30 分钟'
  }],
  ['手工水饺', {
    replaceIngredients: ['中筋面粉', '冷水', '猪肉末', '韭菜', '姜', '小葱', '生抽', '蚝油', '香油', '盐', '清水'],
    replacePreparation: [
      '中筋面粉 300g',
      '冷水 160ml（和面用）',
      '猪肉末 300g',
      '韭菜 250g',
      '姜 10g',
      '小葱 10g',
      '生抽 15ml',
      '蚝油 10g',
      '香油 10ml',
      '盐 5g',
      '清水 60ml（调馅用）'
    ],
    replaceSteps: [
      '面粉中分次加入 160ml 冷水，搅成絮状后揉成面团；盖好醒 20 分钟，再揉至光滑，继续醒 20 分钟。',
      '姜和小葱切末；韭菜洗净后彻底晾干，切成约 5mm 小段。',
      '猪肉末加入姜末、葱末、生抽、蚝油和 3g 盐，顺一个方向搅拌；60ml 清水分 3 次加入，每次搅至吸收。',
      '韭菜先与香油拌匀，包制前再与肉馅和剩余盐混合。',
      '醒好的面团搓成长条，分成约 40 个剂子；按扁后擀成中间稍厚、边缘稍薄的圆皮。',
      '每张皮放适量馅料，对折并将边缘捏紧；包好的饺子间隔摆放并盖布防干。',
      '大锅加入足量清水并烧开，分批下饺子后用漏勺沿锅底轻推防粘。',
      '水再次沸腾后转中火，保持稳定沸腾 6-8 分钟；饺子鼓起浮在水面，切开一个确认肉馅完全熟透后捞出。'
    ],
    cookingTime: '100分钟',
    advanceTime: '面团需分两次醒面，共约 40 分钟'
  }],
  ['鲜肉烧卖', {
    replaceIngredients: ['烧卖皮', '猪肉末', '鲜香菇', '冬笋（可选）', '姜', '小葱', '生抽', '料酒', '盐', '白砂糖', '白胡椒粉', '芝麻油', '玉米淀粉', '高汤或清水'],
    replacePreparation: [
      '烧卖皮 30张（约300g）',
      '猪肉末 300g（肥瘦约3:7）',
      '鲜香菇 80g',
      '冬笋 50g（可选）',
      '姜 8g',
      '小葱 15g',
      '生抽 15ml',
      '料酒 10ml',
      '盐 3g',
      '白砂糖 3g',
      '白胡椒粉 1g',
      '芝麻油 5ml',
      '玉米淀粉 5g',
      '高汤或清水 60ml'
    ],
    replaceSteps: [
      '香菇和冬笋切细丁，姜和小葱切末；香菇和冬笋用沸水焯 1 分钟，捞出后挤去多余水分。',
      '猪肉末加入姜末、生抽、料酒、盐、白砂糖、白胡椒粉和玉米淀粉，顺一个方向搅拌。',
      '高汤或清水分 3 次加入肉馅，每次搅至完全吸收；再拌入香菇、冬笋、葱末和芝麻油，冷藏 20 分钟。',
      '烧卖皮边缘用擀面杖擀薄，中央放约 20g 馅料。',
      '用虎口轻轻收拢皮边，捏成顶部留口的烧卖形状，并将底部在案板上轻压平。',
      '蒸笼垫打孔蒸纸或薄薄刷油，烧卖间留出空隙摆放。',
      '蒸锅水烧开后上笼，大火蒸 10-12 分钟，确认中心肉馅完全熟透后取出。'
    ],
    cookingTime: '65分钟',
    advanceTime: '肉馅需冷藏静置 20 分钟'
  }],
  ['扬州炒饭', {
    replaceIngredients: ['冷米饭', '鸡蛋', '虾仁', '火腿', '青豆', '胡萝卜', '玉米粒（可选）', '小葱', '食用油', '盐', '白胡椒粉'],
    replacePreparation: [
      '冷米饭 400g',
      '鸡蛋 2个',
      '虾仁 120g',
      '火腿 80g',
      '青豆 40g',
      '胡萝卜 40g',
      '玉米粒 40g（可选）',
      '小葱 2根（约10g）',
      '食用油 25ml',
      '盐 4g',
      '白胡椒粉 0.5g'
    ],
    replaceSteps: [
      '冷米饭提前拨散；火腿和胡萝卜切小丁，小葱的葱白与葱绿分开切碎，鸡蛋打散。',
      '锅中烧开水，将青豆、胡萝卜和玉米粒焯 1-2 分钟，捞出并充分沥水。',
      '炒锅中火加热，倒入 10ml 食用油，将虾仁炒至完全变色卷曲，盛出备用。',
      '锅中再加 8ml 食用油，倒入蛋液快速划散，刚凝固便盛出。',
      '加入剩余食用油和葱白炒香，放入冷米饭，中大火边炒边压散饭团，直至米饭热透且颗粒分明。',
      '加入火腿、蔬菜丁、虾仁和鸡蛋，撒盐和白胡椒粉，大火翻炒 1-2 分钟。',
      '确认虾仁、鸡蛋和米饭全部熟透，撒葱绿翻匀后关火装盘。'
    ],
    cookingTime: '35分钟'
  }],
  ['红烧茄子', {
    replaceIngredients: ['茄子', '青椒', '西红柿', '洋葱', '小葱', '蒜', '食用油', '盐', '生抽', '老抽', '白砂糖', '玉米淀粉', '清水'],
    replacePreparation: [
      '茄子 500g',
      '青椒 1个（约100g）',
      '西红柿 1个（约150g）',
      '洋葱 50g',
      '小葱 1根（约5g）',
      '蒜 4瓣（约16g）',
      '食用油 30ml',
      '盐 4g',
      '生抽 15ml',
      '老抽 3ml',
      '白砂糖 5g',
      '玉米淀粉 10g',
      '清水 80ml'
    ],
    replaceSteps: [
      '茄子切滚刀块，加入 2g 盐拌匀，静置 10 分钟后轻轻挤去析出的水分。',
      '青椒和洋葱切块，西红柿切小块，小葱切葱花，蒜切末。',
      '生抽、老抽、白砂糖、剩余盐、玉米淀粉和清水混合成料汁。',
      '茄子加入 15ml 食用油拌匀；炒锅中火加热，放入茄子煎炒 6-8 分钟，至表面微黄、内部变软后盛出。',
      '锅中倒入剩余食用油，放入葱白、蒜末和洋葱炒香，再加入西红柿炒至出汁。',
      '放入青椒和茄子翻炒 1 分钟，倒入料汁并不断翻动。',
      '料汁完全煮沸并变得透明浓稠后，撒葱绿，翻匀即可。'
    ],
    cookingTime: '35分钟'
  }],
  ['皮蛋豆腐', {
    replaceIngredients: ['内酯豆腐', '皮蛋', '蒜', '小葱', '生抽', '香醋', '白砂糖', '香油', '辣椒油（可选）'],
    replacePreparation: [
      '内酯豆腐 1盒（约350g）',
      '皮蛋 2个',
      '蒜 1瓣（约5g）',
      '小葱 1根（约5g）',
      '生抽 12ml',
      '香醋 10ml',
      '白砂糖 2g',
      '香油 5ml',
      '辣椒油 0-5ml'
    ],
    replaceSteps: [
      '内酯豆腐从盒中完整扣出，沥去多余水分后切块；使用开封即食的豆腐，并保持刀具和案板清洁。',
      '皮蛋去壳切瓣，摆在豆腐周围；蒜切末，小葱切葱花。',
      '生抽、香醋、白砂糖、香油、蒜末和辣椒油混合，搅拌至糖溶化。',
      '料汁均匀淋在皮蛋和豆腐上，撒葱花；现做现吃，暂不食用时立即冷藏。'
    ],
    cookingTime: '10分钟'
  }],
  ['咖喱肥牛', {
    replaceIngredients: ['肥牛卷', '土豆', '胡萝卜', '洋葱', '咖喱块', '纯牛奶', '香叶', '食用油', '清水'],
    replacePreparation: [
      '肥牛卷 300g',
      '土豆 200g',
      '胡萝卜 150g',
      '洋葱 100g',
      '咖喱块 100g',
      '纯牛奶 50ml',
      '香叶 1片',
      '食用油 15ml',
      '清水 约1500ml（焯水1000ml，炖煮约500ml）'
    ],
    replaceSteps: [
      '洋葱切条，土豆和胡萝卜去皮后切成约 2cm 的块。',
      '锅中加入约 1000ml 清水并烧开，放入肥牛卷，待肉片完全变色后捞出，冲去浮沫并沥水。',
      '炒锅中火加热，倒入食用油，放入洋葱炒至变软、略微透明。',
      '加入土豆和胡萝卜翻炒 2 分钟，再加入香叶和约 500ml 清水，以水面接近没过食材为准。',
      '大火煮开后转小火，加盖炖 15-20 分钟，至土豆和胡萝卜可被筷子轻松插入。',
      '关小火，放入咖喱块并不断搅拌至完全溶化，再加入牛奶搅匀。',
      '放入焯好的肥牛卷，小火煮 2-3 分钟；确认肉片热透、汤汁达到喜欢的浓度后关火。'
    ],
    cookingTime: '40分钟'
  }],
  ['蒜蓉西兰花', {
    replaceIngredients: ['西兰花', '大蒜', '食用油', '生抽', '蚝油', '白砂糖', '清水'],
    replacePreparation: [
      '西兰花 200g',
      '大蒜 4瓣（约16g）',
      '食用油 10ml',
      '生抽 10ml',
      '蚝油 5g',
      '白砂糖 2g',
      '清水 1030ml（焯水1000ml，料汁30ml）'
    ],
    replaceSteps: [
      '西兰花切成大小接近的小朵，用流动清水洗净；大蒜去皮切末。',
      '锅中加入 1000ml 清水，大火烧开后放入西兰花，焯 2-3 分钟至颜色翠绿。',
      '将西兰花捞出并充分沥水，整齐摆入盘中。',
      '炒锅小火加热，倒入食用油，放入蒜末炒至出香味，不要炒焦。',
      '加入生抽、蚝油、白砂糖和剩余 30ml 清水，搅匀后煮沸约 30 秒。',
      '将蒜蓉料汁均匀淋在西兰花上，趁热食用。'
    ],
    cookingTime: '15分钟'
  }],
  ['手抓饼', {
    replaceIngredients: ['中筋面粉', '开水', '冷水', '食用油', '盐', '鸡蛋', '生菜', '火腿', '芝士片（可选）'],
    replacePreparation: [
      '中筋面粉 200g',
      '开水 80ml',
      '冷水 40-50ml',
      '食用油 15ml（饼坯10ml，煎制5ml）',
      '盐 2g',
      '鸡蛋 1个',
      '生菜 30g',
      '火腿 30g',
      '芝士片 1片（可选）'
    ],
    replaceSteps: [
      '面粉中先倒入开水，用筷子搅成絮状；再分次加入冷水，揉成柔软且不粘手的面团，盖好醒 20 分钟。',
      '面团分成 2 个剂子，分别擀成薄片；表面刷 10ml 食用油并均匀撒盐。',
      '将面片卷成长条，再盘成蜗牛状，盖好松弛 10 分钟后擀成约 3mm 厚的圆饼。',
      '生菜逐片洗净并沥干；火腿两面煎热，鸡蛋煎至蛋白和蛋黄完全凝固。',
      '平底锅刷剩余食用油，中小火放入饼坯，每面煎 2-3 分钟；翻面时用锅铲轻压，使饼层散开并均匀受热。',
      '确认饼坯中心熟透、两面金黄后取出，夹入鸡蛋、生菜、火腿和可选芝士，卷起即可。'
    ],
    cookingTime: '45分钟',
    advanceTime: '面团需醒面和松弛共 30 分钟'
  }],
  ['煎饺', {
    replaceIngredients: ['速冻水饺', '食用油', '清水', '黑芝麻（可选）', '小葱（可选）'],
    replacePreparation: [
      '速冻水饺 10-15个（约300g，无需解冻）',
      '食用油 12ml',
      '清水 150ml',
      '黑芝麻 2g（可选）',
      '小葱 1根（约5g，可选）'
    ],
    replaceSteps: [
      '小葱洗净切葱花；确认使用可生煎的速冻水饺，并按包装说明适当调整时间。',
      '不粘平底锅加入食用油，中火放入未解冻的水饺，彼此留出少量空隙。',
      '煎约 1 分钟至底部微黄，沿锅边倒入清水，立即盖上锅盖。',
      '转中小火焖煮 8-10 分钟，直至水量明显减少、水饺皮变得透明。',
      '打开锅盖，让剩余水分完全蒸发；继续煎 1-2 分钟，使底部形成金黄色脆壳。',
      '切开一个水饺确认馅料中心完全熟透，撒上可选的黑芝麻和葱花后出锅。'
    ],
    cookingTime: '15分钟'
  }],
  ['燕麦鸡蛋饼', {
    replaceIngredients: ['快熟燕麦片', '鸡蛋', '牛奶', '食用油或黄油', '菠菜（可选）', '盐（可选）', '白胡椒粉（可选）'],
    replacePreparation: [
      '快熟燕麦片 50g',
      '鸡蛋 2个',
      '牛奶 80ml',
      '食用油或黄油 5ml',
      '菠菜 50g（可选）',
      '盐 1g（可选）',
      '白胡椒粉 0.5g（可选）'
    ],
    replaceSteps: [
      '燕麦片与牛奶混合，静置 5 分钟使燕麦吸水变软。',
      '鸡蛋充分打散；使用菠菜时，将菠菜洗净、焯水 30 秒并挤干后切碎。',
      '蛋液、泡软的燕麦和可选菠菜混合，加入盐和白胡椒粉搅匀。',
      '不粘平底锅刷油，中小火倒入面糊并摊成厚度均匀的圆饼。',
      '加盖煎 3-4 分钟，待底部定型、表面基本凝固后翻面。',
      '另一面继续煎 2-3 分钟，确认中心蛋液完全凝固后出锅。'
    ],
    cookingTime: '15分钟'
  }],
  ['茶叶蛋', {
    replaceIngredients: ['鸡蛋', '红茶', '八角', '香叶', '桂皮', '小茴香', '生抽', '老抽', '冰糖', '盐', '清水'],
    replacePreparation: [
      '鸡蛋 8个',
      '红茶 10g',
      '八角 2颗（约4g）',
      '香叶 2片',
      '桂皮 1小块（约3g）',
      '小茴香 3g',
      '生抽 25ml',
      '老抽 10ml',
      '冰糖 10g',
      '盐 4g',
      '清水 1L'
    ],
    replaceSteps: [
      '鸡蛋轻轻刷洗，放入锅中并加入没过鸡蛋的冷水；中火煮开后转小火煮 9 分钟。',
      '鸡蛋捞入冷水中降温，待不烫手后用勺背轻敲，使蛋壳形成均匀裂纹。',
      '锅中加入 1L 清水、红茶、八角、香叶、桂皮、小茴香、生抽、老抽、冰糖和盐，煮开 5 分钟。',
      '放入带壳鸡蛋，重新煮开后转小火煮 30 分钟。',
      '关火后让鸡蛋在卤汁中自然降温；2 小时内连同卤汁一起移入冰箱冷藏。',
      '冷藏浸泡 8-12 小时后食用更入味；取食时使用干净餐具，并在 2 天内吃完。'
    ],
    cookingTime: '55分钟',
    advanceTime: '煮好后建议冷藏浸泡 8-12 小时'
  }],
  ['水煮玉米', {
    replaceIngredients: ['新鲜玉米', '盐', '白砂糖（可选）', '清水'],
    replacePreparation: [
      '新鲜玉米 1根（约300g）',
      '盐 2g',
      '白砂糖 5g（可选）',
      '清水 约1500ml（以没过玉米为准）'
    ],
    replaceSteps: [
      '玉米剥去最外层老叶和玉米须，保留内层 1-2 层嫩叶，冲洗干净。',
      '玉米放入大小合适的锅中，加入足以没过玉米的清水，再加入盐和白砂糖。',
      '大火煮开后转中小火，加盖煮 10-15 分钟；较老或颗粒较硬的玉米适当延长时间。',
      '夹出一粒玉米尝一下，确认中心熟透且达到喜欢的软硬度后关火。',
      '玉米捞出沥水，趁温热食用。'
    ],
    cookingTime: '20分钟'
  }],
  ['牛奶燕麦', {
    replaceIngredients: ['即食或快熟燕麦片', '牛奶', '清水（可选）'],
    replacePreparation: [
      '即食或快熟燕麦片 40g',
      '牛奶 250ml',
      '清水 0-100ml（喜欢稀一些时添加）'
    ],
    replaceSteps: [
      '炉灶做法：燕麦片、牛奶和可选的清水放入小锅，中小火加热并持续搅拌。',
      '液体微沸后转小火，按燕麦包装说明煮 3-5 分钟，直至燕麦变软、整体略微浓稠。',
      '微波炉做法：所有材料放入容量至少为食材体积 3 倍的微波炉适用大碗中，不要使用密闭容器。',
      '以中高火加热 2 分钟，取出搅拌，再每次加热 30 秒，直至燕麦熟软；全程留意防止溢出。',
      '静置 1-2 分钟，温度适口后食用。'
    ],
    cookingTime: '10分钟'
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

  const ingredients = correction.replaceIngredients || recipe.ingredients
  let preparation = correction.replacePreparation || recipe.preparation
  if (correction.removePreparation) {
    preparation = preparation.filter(item => !correction.removePreparation.some(pattern => pattern.test(item)))
  }
  if (correction.preparationEdits) {
    preparation = preparation.map(item => correction.preparationEdits.reduce(
      (value, edit) => value.replace(edit.match, edit.replace),
      item
    ))
  }

  let steps = correction.replaceSteps || recipe.steps
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
    ingredients: appendUnique(ingredients, correction.addIngredients),
    preparation: appendUnique(preparation, correction.addPreparation),
    steps,
    nutrition: correction.nutrition || recipe.nutrition,
    cookingTime: correction.cookingTime || recipe.cookingTime,
    methodVariant: correction.methodVariant || '',
    advanceTime: correction.advanceTime || '',
    correctionCount: [
      ...(correction.addIngredients || []),
      ...(correction.addPreparation || []),
      ...(correction.replaceIngredients || []),
      ...(correction.replacePreparation || []),
      ...(correction.removePreparation || []),
      ...(correction.preparationEdits || []),
      ...(correction.replaceSteps || []),
      ...(correction.removeSteps || []),
      ...(correction.stepEdits || []),
      ...(correction.nutrition ? ['nutrition'] : []),
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
  const preferredFileName = preferredLocalImages.get(title)

  if (preferredFileName) {
    const sourceImagePath = path.resolve(path.dirname(recipePath), preferredFileName)
    if (sourceImagePath.startsWith(`${dishesRoot}${path.sep}`)) {
      try {
        const metadata = await sharp(sourceImagePath).metadata()
        if (metadata.width && metadata.height) {
          candidates.push({
            index: Number.MAX_SAFE_INTEGER,
            alt: title,
            reference: preferredFileName,
            sourceImagePath,
            score: 1000
          })
        }
      } catch {
        // A configured image is ignored when it is missing or unreadable.
      }
    }
  }

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
  if (/炸酱面/.test(title)) return '煮制'
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
    cookingTime: getCookingTime(markdown, parsedSteps),
    nutrition: getCalories(markdown)
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
    nutrition: parsedRecipe.nutrition,
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
