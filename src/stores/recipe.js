import { defineStore } from 'pinia'

// 菜品特征映射表
const DISH_CHARACTERISTICS = {
  // 烹饪方式
  COOKING_METHODS: {
    RED_BRAISED: '红烧',
    STIR_FRIED: '清炒',
    STEAMED: '清蒸',
    COLD_MIXED: '凉拌',
    DEEP_FRIED: '油炸',
    BOILED: '水煮',
    ROASTED: '烤制',
    BRAISED: '炖',
    QUICK_FRIED: '炒'
  },
  // 口味特点
  TASTES: {
    SPICY: '麻辣',
    SWEET: '甜',
    SALTY: '咸鲜',
    LIGHT: '清淡',
    SOUR: '酸',
    NUMBING: '麻',
    SAVORY: '鲜',
    GARLIC: '蒜香'
  },
  // 菜品分类
  CATEGORIES: {
    VEGETABLE: '素菜',
    MEAT: '荤菜',
    SEAFOOD: '水产',
    STAPLE: '主食',
    SOUP: '汤类',
    BREAKFAST: '早餐',
    COLD_DISH: '凉菜',
    SNACK: '小吃'
  },
  // 难度等级
  DIFFICULTY: {
    EASY: '简单',
    NORMAL: '普通',
    HARD: '困难'
  }
}

// 备选搭配菜品库
const PAIRING_DISHES = {
  // 清淡类菜品
  LIGHT_DISHES: [
    {
      id: 2,
      name: '白灼菜心',
      image: '/baizhuocaixin.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE,
      taste: DISH_CHARACTERISTICS.TASTES.LIGHT,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BOILED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
      cookingTime: '10分钟',
      ingredients: ['菜心', '盐', '生抽', '蒜末'],
      steps: [
        '菜心洗净，切去老根部，主茎切段（约4cm长）',
        '锅中加入适量清水（约1500ml），加入1茶匙盐',
        '水开后放入菜心，保持大火',
        '煮至菜心变软变绿，约2-3分钟',
        '迅速捞出沥干水分，摆盘',
        '淋上1汤匙生抽，撒上1茶匙蒜末',
        '可以再淋上少许热油提香'
      ],
      pairingReason: '主菜口味浓郁，搭配清淡爽口的白灼菜心可以中和口味，清新可口。',
      benefits: [
        '清淡爽口，解腻开胃',
        '保留蔬菜原汁原味和营养',
        '烹饪方式健康，不额外加油'
      ]
    },
    {
      id: 5,
      name: '上汤娃娃菜',
      image: '/wawacai.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE,
      taste: DISH_CHARACTERISTICS.TASTES.LIGHT,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BOILED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
      cookingTime: '15分钟',
      ingredients: ['娃娃菜', '高汤', '盐', '胡椒粉', '葱花'],
      steps: [
        '娃娃菜洗净，去根，对半切开',
        '准备高汤：鸡骨熬制的高汤约500ml',
        '锅中加入高汤，大火烧开',
        '放入娃娃菜，中火煮3-4分钟至变软',
        '加入适量盐（约1/2茶匙）和胡椒粉（约1/4茶匙）调味',
        '撒上葱花，可以淋上少许香油提香',
        '确保娃娃菜保持翠绿，不要煮过火'
      ],
      pairingReason: '搭配清淡的上汤娃娃菜，既能解腻又营养均衡。',
      benefits: [
        '清甜可口，不油腻',
        '高汤提鲜，营养丰富',
        '开胃助消化'
      ]
    }
  ],
  // 爽脆类菜品
  CRISPY_DISHES: [
    {
      id: 3,
      name: '凉拌莴笋',
      image: '/wosun.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.COLD_DISH,
      taste: DISH_CHARACTERISTICS.TASTES.LIGHT,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.COLD_MIXED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
      cookingTime: '20分钟',
      ingredients: ['莴笋', '盐', '醋', '蒜末', '香油', '生抽'],
      steps: [
        '莴笋去皮，切丝',
        '加入适量盐腌制10分钟',
        '挤干水分',
        '加入醋、蒜末、香油、生抽调味',
        '拌匀即可'
      ],
      pairingReason: '主菜质地软烂，搭配爽脆的莴笋可以增添口感层次。',
      benefits: [
        '爽脆可口，清新解腻',
        '莴笋富含膳食纤维',
        '开胃助消化'
      ]
    },
    {
      id: 7,
      name: '炝炒藕片',
      image: '/oupian.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE,
      taste: DISH_CHARACTERISTICS.TASTES.SPICY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.QUICK_FRIED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
      cookingTime: '20分钟',
      ingredients: ['莲藕', '青红椒', '干辣椒', '蒜', '醋', '生抽'],
      steps: [
        '莲藕去皮切片',
        '青红椒切丝，蒜切片',
        '锅中油热，爆香干辣椒',
        '加入藕片快速翻炒',
        '加入青红椒和蒜片',
        '加入醋和生抽调味',
        '大火翻炒断生即可'
      ],
      pairingReason: '藕片的脆嫩口感和微辣的味道，可以提供不同的味觉体验。',
      benefits: [
        '藕片脆嫩爽口',
        '富含膳食纤维和铁质',
        '开胃解腻效果好'
      ]
    }
  ],
  // 凉菜类
  COLD_DISHES: [
    {
      id: 4,
      name: '凉拌黄瓜',
      image: '/huanggua.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.COLD_DISH,
      taste: DISH_CHARACTERISTICS.TASTES.GARLIC,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.COLD_MIXED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
      cookingTime: '10分钟',
      ingredients: ['黄瓜', '蒜', '盐', '醋', '香油'],
      steps: [
        '黄瓜洗净，拍碎成小块',
        '蒜切末',
        '加入适量盐腌制5分钟',
        '挤干多余水分',
        '加入蒜末、醋、香油拌匀即可'
      ],
      pairingReason: '清脆爽口的黄瓜配上蒜香，可以开胃解腻。',
      benefits: [
        '清凉爽口，开胃解腻',
        '黄瓜水分充足，帮助解油腻',
        '简单快手，容易准备'
      ]
    }
  ]
}

// 主食类
const STAPLE_DISHES = {
  RICE_DISHES: [
    {
      id: 101,
      name: '蛋炒饭',
      image: '/images/dishes/danchaofan.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.STAPLE,
      taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.QUICK_FRIED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
      cookingTime: '15分钟',
      ingredients: ['隔夜米饭', '鸡蛋', '葱花', '盐', '生抽'],
      steps: [
        '将鸡蛋打散',
        '锅中放油烧热，倒入蛋液炒散',
        '加入隔夜米饭，翻炒均匀',
        '加入适量盐和生抽调味',
        '最后撒上葱花即可'
      ],
      nutrition: {
        calories: '350大卡/份',
        protein: '10克/份',
        carbs: '60克/份'
      }
    },
    {
      id: 103,
      name: '扬州炒饭',
      image: '/images/dishes/yangzhouchaofan.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.STAPLE,
      taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.QUICK_FRIED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
      cookingTime: '20分钟',
      ingredients: ['米饭', '虾仁', '火腿', '胡萝卜', '豌豆', '鸡蛋'],
      steps: [
        '所有配料切丁',
        '炒散鸡蛋，约3分钟',
        '炒制虾仁和火腿，约2分钟',
        '加入米饭翻炒，约3分钟',
        '加入胡萝卜和豌豆，约2分钟',
        '调味即可，约1分钟'
      ],
      nutrition: {
        calories: '380大卡/份',
        protein: '15克/份',
        carbs: '55克/份'
      }
    }
  ],
  NOODLE_DISHES: [
    {
      id: 102,
      name: '阳春面',
      image: '/images/dishes/yangchunmian.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.STAPLE,
      taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BOILED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
      cookingTime: '15分钟',
      ingredients: ['阳春面', '葱花', '香菜', '盐', '生抽', '香油'],
      steps: [
        '锅中加水烧开，放入面条，约8分钟',
        '煮至7分熟时加入适量盐，约2分钟',
        '煮至全熟捞出沥干，约1分钟',
        '加入生抽、香油调味，约1分钟',
        '撒上葱花和香菜即可'
      ],
      nutrition: {
        calories: '300大卡/份',
        protein: '8克/份',
        carbs: '55克/份'
      }
    },
    {
      id: 104,
      name: '担担面',
      image: '/images/dishes//dandanmian.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.STAPLE,
      taste: DISH_CHARACTERISTICS.TASTES.SPICY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BOILED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
      cookingTime: '20分钟',
      ingredients: ['面条', '猪肉末', '花生碎', '芽菜', '辣椒油', '花椒'],
      steps: [
        '猪肉末加入料酒、生抽腌制10分钟',
        '锅中油温5成热，放入猪肉末炒散，加入适量盐，约3分钟',
        '面条下入沸水，煮至7分熟，约4分钟',
        '准备调味料：将辣椒油、花椒粉、蒜末、生抽、醋调匀',
        '将煮好的面条沥干放入碗中',
        '浇上调好的料汁和炒好的肉末',
        '最后撒上花生碎、葱花，拌匀即可食用'
      ],
      nutrition: {
        calories: '450大卡/份',
        protein: '20克/份',
        carbs: '65克/份'
      }
    },
    {
      id: 105,
      name: '炸酱面',
      image: '/images/dishes//zhajiangmian.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.STAPLE,
      taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BOILED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
      cookingTime: '25分钟',
      ingredients: ['面条', '猪肉末', '甜面酱', '黄瓜', '豆芽', '葱花'],
      steps: [
        '猪肉末加入料酒、生抽腌制10分钟',
        '锅中油温5成热，放入猪肉末炒散，约3分钟',
        '加入甜面酱小火翻炒至香浓，约2分钟',
        '面条下入沸水煮至7分熟，约4分钟',
        '黄瓜切丝，豆芽焯烫，葱花切段',
        '将煮好的面条沥干放入碗中',
        '浇上炒好的炸酱',
        '摆上黄瓜丝、豆芽、葱花，拌匀即可食用'
      ],
      nutrition: {
        calories: '420大卡/份',
        protein: '18克/份',
        carbs: '60克/份'
      }
    }
  ]
}

// 荤菜类
const MEAT_DISHES = {
  PORK_DISHES: [
    {
      id: 201,
      name: '红烧肉',
      image: '/images/dishes/hongshaorou.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.MEAT,
      taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.RED_BRAISED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
      cookingTime: '45分钟',
      ingredients: ['五花肉', '生抽', '老抽', '料酒', '八角', '桂皮', '冰糖'],
      steps: [
        '五花肉切4cm见方的大块',
        '冷水下锅焯烫去血水，约3分钟',
        '锅中放油烧至5成热，加入冰糖小火炒至焦糖色，约5分钟',
        '放入肉块中火翻炒至表面金黄，约3分钟',
        '加入八角、桂皮爆香，约2分钟',
        '加入生抽、老抽调色，约1分钟',
        '加入开水没过肉块2厘米，大火烧开后转小火慢炖40分钟',
        '转中火收汁，汤汁收至裹住肉块即可，约10分钟'
      ],
      nutrition: {
        calories: '450大卡/100克',
        protein: '20克/100克',
        fat: '35克/100克'
      }
    },
    {
      id: 202,
      name: '回锅肉',
      image: '/images/dishes/huiguorou.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.MEAT,
      taste: DISH_CHARACTERISTICS.TASTES.SPICY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.QUICK_FRIED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
      cookingTime: '30分钟',
      ingredients: ['五花肉', '青椒', '蒜苗', '豆瓣酱', '料酒', '生抽'],
      steps: [
        '五花肉切成3mm薄片，青椒切菱形片，蒜苗切4cm长段，姜切丝',
        '锅中加水烧开，放入肉片焯烫至变色，约2分钟，捞出沥干',
        '另起锅，油温5成热，放入豆瓣酱小火炒出红油，约2分钟',
        '加入姜丝爆香，约30秒',
        '转中火放入焯烫好的肉片翻炒至表面微卷，约3分钟',
        '加入青椒和蒜苗快速翻炒，保持青椒脆嫩，约2分钟',
        '加入适量生抽、料酒调味，大火翻炒均匀，约1分钟',
        '确保肉片外焦里嫩，出锅前撒上葱花点缀'
      ],
      nutrition: {
        calories: '400大卡/100克',
        protein: '18克/100克',
        fat: '32克/100克'
      }
    }
  ],
  CHICKEN_DISHES: [
    {
      id: 203,
      name: '宫保鸡丁',
      image: '/images/dishes/gongbaojiding.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.MEAT,
      taste: DISH_CHARACTERISTICS.TASTES.SPICY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.QUICK_FRIED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
      cookingTime: '25分钟',
      ingredients: ['鸡胸肉', '花生', '干辣椒', '葱姜', '料酒', '生抽', '醋'],
      steps: [
        '将鸡胸肉切成2cm大小的丁，用料酒、生抽、淀粉腌制15分钟',
        '花生提前炒熟备用，约5分钟',
        '锅中放油烧至7成热，爆香干辣椒和花椒，约2分钟',
        '加入腌制好的鸡丁中火翻炒至变色，约3分钟',
        '加入生抽、醋等调味料翻炒，约2分钟',
        '最后加入炒好的花生翻炒均匀，约1分钟',
        '出锅前撒上葱花点缀'
      ],
      nutrition: {
        calories: '250大卡/100克',
        protein: '25克/100克',
        fat: '15克/100克'
      }
    }
  ]
}

// 海鲜类
const SEAFOOD_DISHES = {
  FISH_DISHES: [
    {
      id: 301,
      name: '清蒸鲈鱼',
      image: '/images/dishes/qingzhengluyu.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.SEAFOOD,
      taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.STEAMED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
      cookingTime: '20分钟',
      ingredients: ['鲈鱼', '葱', '姜', '蒜', '酱油', '料酒'],
      steps: [
        '鲈鱼清洗干净，擦干水分',
        '鱼身两面划几刀，抹上料酒腌制10分钟',
        '葱姜蒜切丝',
        '将葱姜蒸在鱼腹和鱼身上',
        '大火将水烧开，放入鱼',
        '蒸8-10分钟',
        '取出后淋上热油和酱油',
        '撒上葱花即可'
      ],
      nutrition: {
        calories: '120大卡/100克',
        protein: '20克/100克',
        fat: '3克/100克'
      }
    },
    {
      id: 302,
      name: '红烧鱼块',
      image: '/images/dishes/hongshaoyukuai.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.SEAFOOD,
      taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.RED_BRAISED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
      cookingTime: '25分钟',
      ingredients: ['草鱼', '葱', '姜', '蒜', '豆瓣酱', '料酒', '生抽'],
      steps: [
        '草鱼切块，腌制料酒10分钟',
        '锅中油热，放入葱姜蒜爆香',
        '加入豆瓣酱炒出红油',
        '放入鱼块翻炒',
        '加入适量水，大火烧开',
        '转小火炖15分钟',
        '收汁即可'
      ],
      nutrition: {
        calories: '150大卡/100克',
        protein: '18克/100克',
        fat: '8克/100克'
      }
    }
  ],
  SHRIMP_DISHES: [
    {
      id: 303,
      name: '油焖大虾',
      image: '/images/dishes/youmendaxia.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.SEAFOOD,
      taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BRAISED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.HARD,
      cookingTime: '20分钟',
      ingredients: ['大虾', '葱', '姜', '蒜', '料酒', '生抽'],
      steps: [
        '大虾去头去虾线，保留虾尾',
        '锅中放油烧热，放入葱姜蒜爆香，约2分钟',
        '放入大虾翻炒变色，约3分钟',
        '加入料酒和生抽，小火焖煮5分钟',
        '收汁即可，约2分钟'
      ],
      nutrition: {
        calories: '120大卡/100克',
        protein: '15克/100克',
        fat: '5克/100克'
      }
    }
  ]
}

// 汤类
const SOUP_DISHES = [
  {
    id: 401,
    name: '番茄蛋汤',
    image: '/images/dishes/fanqiedantang.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.SOUP,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BOILED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
    cookingTime: '15分钟',
    ingredients: ['番茄', '鸡蛋', '葱花', '盐'],
    steps: [
      '番茄切块',
      '锅中加水烧开，放入番茄，煮至番茄软化，约5分钟',
      '打散鸡蛋，慢慢倒入锅中搅拌，约2分钟',
      '加入适量盐调味',
      '撒上葱花即可'
    ],
    nutrition: {
      calories: '80大卡/碗',
      protein: '5克/碗',
      vitamins: '维生素C, 番茄红素'
    }
  },
  {
    id: 402,
    name: '紫菜蛋花汤',
    image: '/images/dishes/zicaidanhua.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.SOUP,
    taste: DISH_CHARACTERISTICS.TASTES.LIGHT,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BOILED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
    cookingTime: '10分钟',
    ingredients: ['紫菜', '鸡蛋', '葱花', '盐'],
    steps: [
      '锅中加水烧开',
      '打散鸡蛋，约1分钟',
      '加入适量盐，约1分钟',
      '将鸡蛋慢慢倒入锅中搅拌，约2分钟',
      '放入紫菜，约1分钟',
      '最后撒上葱花即可'
    ],
    nutrition: {
      calories: '60大卡/碗',
      protein: '4克/碗',
      minerals: '碘, 铁'
    }
  }
]

// 素菜类
const VEGETABLE_DISHES = {
  LEAFY_GREENS: [
    {
      id: 501,
      name: '蒜蓉炒菜心',
      image: '/images/dishes/suanrongcaixin.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE,
      taste: DISH_CHARACTERISTICS.TASTES.GARLIC,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.STIR_FRIED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
      cookingTime: '10分钟',
      ingredients: ['菜心', '蒜', '盐', '生抽'],
      steps: [
        '菜心洗净切段',
        '蒜切末',
        '锅中油热，爆香蒜末，约2分钟',
        '放入菜心翻炒，约3分钟',
        '加入适量盐和生抽调味，约1分钟',
        '炒至断生即可，约2分钟'
      ],
      nutrition: {
        calories: '45大卡/100克',
        fiber: '2.5克/100克',
        vitamins: '维生素C, 叶酸'
      }
    },
    {
      id: 502,
      name: '炒青菜',
      image: '/images/dishes/chaocai.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE,
      taste: DISH_CHARACTERISTICS.TASTES.GARLIC,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.STIR_FRIED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
      cookingTime: '10分钟',
      ingredients: ['青菜', '蒜', '盐', '生抽'],
      steps: [
        '青菜洗净切段',
        '锅中油热，放入蒜末爆香，约2分钟',
        '加入青菜快速翻炒，约3分钟',
        '加入适量盐调味，约1分钟',
        '炒至菜叶软熟即可，约2分钟'
      ],
      nutrition: {
        calories: '30大卡/100克',
        fiber: '2克/100克',
        vitamins: '维生素C, 叶酸'
      }
    }
  ],
  MUSHROOMS: [
    {
      id: 503,
      name: '蒜香杏鲍菇',
      image: '/images/dishes/xingbaogu.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE,
      taste: DISH_CHARACTERISTICS.TASTES.GARLIC,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.STIR_FRIED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
      cookingTime: '15分钟',
      ingredients: ['杏鲍菇', '蒜', '盐', '生抽', '料酒'],
      steps: [
        '杏鲍菇切片',
        '蒜切末',
        '锅中油热，爆香蒜末',
        '放入杏鲍菇片翻炒',
        '加入料酒和生抽',
        '最后加盐调味'
      ],
      nutrition: {
        calories: '55大卡/100克',
        protein: '3克/100克',
        fiber: '2克/100克'
      }
    }
  ],
  ROOT_VEGETABLES: [
    {
      id: 504,
      name: '酸辣土豆丝',
      image: '/images/dishes/suanlatudousi.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE,
      taste: DISH_CHARACTERISTICS.TASTES.SOUR,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.QUICK_FRIED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
      cookingTime: '20分钟',
      ingredients: ['土豆', '干辣椒', '醋', '盐', '葱花'],
      steps: [
        '土豆切丝，用水浸泡去除多余淀粉，约10分钟',
        '锅中油热，放入干辣椒和花椒爆香，约2分钟',
        '加入土豆丝快速翻炒，约5分钟',
        '加入醋和适量盐调味，快速翻炒均匀，约2分钟',
        '炒至土豆丝断生即可，约3分钟'
      ],
      nutrition: {
        calories: '70大卡/100克',
        carbs: '15克/100克',
        fiber: '2克/100克'
      }
    }
  ],
  BEAN_SPROUTS: [
    {
      id: 505,
      name: '韭黄炒豆芽',
      image: '/images/dishes/jiuhuangdouya.jpg',
      category: DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE,
      taste: DISH_CHARACTERISTICS.TASTES.LIGHT,
      cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.QUICK_FRIED,
      difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
      cookingTime: '10分钟',
      ingredients: ['豆芽', '韭黄', '盐', '生抽'],
      steps: [
        '豆芽洗净沥干，韭黄切段约5cm长',
        '锅中油温7成热，放入豆芽快速翻炒，约1分钟',
        '加入韭黄继续大火翻炒，约1分钟',
        '加入适量盐和生抽调味，快速翻炒均匀，约30秒',
        '确保豆芽断生但保持脆嫩，韭黄不过火即可出锅'
      ],
      nutrition: {
        calories: '40大卡/100克',
        protein: '3克/100克',
        vitamins: '维生素C, 维生素E'
      }
    }
  ]
}

// 特色菜
const SPECIALTY_DISHES = [
  {
    id: 601,
    name: '麻婆豆腐',
    image: '/images/dishes/mapodoufu.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.MEAT,
    taste: DISH_CHARACTERISTICS.TASTES.SPICY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BRAISED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '20分钟',
    ingredients: ['豆腐', '猪肉末', '豆瓣酱', '花椒', '葱花', '生抽'],
    steps: [
      '将豆腐切成2cm见方的块，用开水焯烫去腥，约2分钟',
      '锅中加油烧至5成热，放入豆瓣酱小火炒出红油，约3分钟',
      '加入蒜末、姜末爆香，约30秒',
      '加入腌制好的猪肉末中火炒至出油，约4分钟',
      '放入豆腐块，轻轻翻炒避免豆腐碎散，约2分钟',
      '加入适量清水（没过豆腐一半），小火炖煮，约5分钟',
      '调入适量盐、生抽、白胡椒粉调味，约1分钟',
      '最后撒上花椒粉和葱花，轻轻翻炒均匀后出锅'
    ],
    nutrition: {
      calories: '180大卡/100克',
      protein: '12克/100克',
      fat: '10克/100克'
    }
  },
  {
    id: 602,
    name: '鱼香茄子', 
    image: '/images/dishes/yuxiangqiezi.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE,
    taste: DISH_CHARACTERISTICS.TASTES.SWEET,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BRAISED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '25分钟',
    ingredients: ['茄子', '猪肉末', '豆瓣酱', '葱姜蒜', '醋', '糖'],
    steps: [
      '茄子切成6cm长、2cm宽的条状，用清水浸泡10分钟去除苦味',
      '猪肉末加入料酒、生抽腌制10分钟',
      '锅中油温烧至7成热（约160度），将茄子炸至表面金黄，约3-4分钟，捞出沥油',
      '另起锅，小火放入葱末、姜末、蒜末爆香，约1分钟',
      '转中火加入腌制好的猪肉末炒散，约2分钟',
      '加入豆瓣酱小火炒香出红油，约2分钟',
      '放入炸好的茄子，加入适量清水（约100ml）',
      '加入醋、糖、生抽调味，中火收汁至浓稠，约3分钟',
      '最后撒上葱花，确保茄子入味即可出锅'
    ],
    nutrition: {
      calories: '150大卡/100克',
      protein: '5克/100克',
      fiber: '3克/100克'
    }
  },
  {
    id: 603,
    name: '水煮鱼',
    image: '/images/dishes/shuizhuyu.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.SEAFOOD,
    taste: DISH_CHARACTERISTICS.TASTES.SPICY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BOILED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.HARD,
    cookingTime: '30分钟',
    ingredients: ['草鱼', '豆芽', '芹菜', '豆瓣酱', '花椒', '干辣椒', '葱姜蒜'],
    steps: [
      '草鱼切片，用料酒、姜片和盐腌制15分钟去腥',
      '豆芽和芹菜洗净，沥干水分备用',
      '锅中油温烧至7成热，爆香花椒和干辣椒，约1分钟',
      '加入豆瓣酱小火炒出红油，约2分钟',
      '加入适量清水烧开，约3分钟',
      '将腌制好的鱼片轻轻放入，中火煮至变色，约3-4分钟',
      '铺上豆芽和芹菜，继续煮1分钟',
      '最后淋上热油，撒上葱花和香菜即可'
    ],
    nutrition: {
      calories: '200大卡/100克',
      protein: '22克/100克',
      fat: '12克/100克'
    }
  },
  {
    id: 604,
    name: '辣子鸡丁',
    image: '/images/dishes/lazijiding.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.MEAT,
    taste: DISH_CHARACTERISTICS.TASTES.SPICY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.DEEP_FRIED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '25分钟',
    ingredients: ['鸡胸肉', '干辣椒', '花椒', '葱姜蒜', '料酒', '生抽'],
    steps: [
      '鸡胸肉切成2cm大小的丁，用料酒、生抽、盐腌制15分钟去腥',
      '干辣椒切成2cm长段，蒜切片，姜切丝，葱切段',
      '锅中油温烧至8成热（约180度），将腌制好的鸡丁炸至金黄酥脆，约3-4分钟，捞出沥油',
      '另起锅，油温6成热，放入花椒和干辣椒爆香，约1分钟',
      '加入姜丝和蒜片翻炒出香味，约30秒',
      '放入炸好的鸡丁快速翻炒，约2分钟',
      '加入生抽、料酒调味，大火翻炒均匀，约1分钟',
      '最后撒上葱段，确保鸡丁裹满辣椒的香味即可出锅'
    ],
    nutrition: {
      calories: '250大卡/100克',
      protein: '25克/100克',
      fat: '15克/100克'
    }
  },
  {
    id: 605,
    name: '东坡肉',
    image: '/images/dishes/dongporou.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.MEAT,
    taste: DISH_CHARACTERISTICS.TASTES.SWEET,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BRAISED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.HARD,
    cookingTime: '120分钟',
    ingredients: ['五花肉', '葱姜', '料酒', '生抽', '老抽', '冰糖'],
    steps: [
      '五花肉选用三层肉，切成8cm见方的大块',
      '冷水下锅焯烫去血沫，约5分钟后捞出沥干',
      '锅中放油烧至5成热，放入葱段和姜片爆香，约1分钟',
      '加入五花肉块中火翻炒至表面金黄，约5分钟',
      '加入料酒、生抽、老抽和冰糖，小火翻炒至糖色均匀裹住肉块，约3分钟',
      '加入开水没过肉块3厘米，大火烧开后转小火',
      '盖上锅盖炖煮约2小时，期间翻动2-3次避免粘锅',
      '最后转中大火收汁，汤汁浓稠时即可出锅'
    ],
    nutrition: {
      calories: '500大卡/100克',
      protein: '22克/100克',
      fat: '40克/100克'
    }
  },
  {
    id: 606,
    name: '糖醋排骨',
    image: '/images/dishes/tangcupaigu.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.MEAT,
    taste: DISH_CHARACTERISTICS.TASTES.SWEET,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.DEEP_FRIED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '40分钟',
    ingredients: ['排骨', '料酒', '生抽', '醋', '糖', '葱姜'],
    steps: [
      '排骨切段（约4-5厘米长），用料酒、生抽、姜片腌制15分钟',
      '锅中油温烧至7成热（约170度），将排骨炸至金黄酥脆，约4-5分钟，捞出沥油',
      '另起锅，小火将白糖炒至焦糖色，约2分钟',
      '加入醋、生抽调味，快速搅拌均匀，约1分钟',
      '放入炸好的排骨，中火翻炒均匀裹上糖醋汁，约2分钟',
      '确保每块排骨都均匀裹上酱汁，汁水略干即可出锅',
      '装盘后撒上熟白芝麻点缀'
    ],
    nutrition: {
      calories: '350大卡/100克',
      protein: '25克/100克',
      fat: '20克/100克'
    }
  },
  {
    id: 607,
    name: '蒜蓉粉丝蒸扇贝',
    image: '/images/dishes/zhengshanbei.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.SEAFOOD,
    taste: DISH_CHARACTERISTICS.TASTES.GARLIC,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.STEAMED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '20分钟',
    ingredients: ['扇贝', '粉丝', '蒜', '葱花', '生抽', '料酒'],
    steps: [
      '扇贝洗净，去除内脏和沙子，用清水反复冲洗3遍',
      '粉丝提前用35度温水浸泡15分钟至软，剪成适中长度，沥干水分',
      '蒜切末（约1茶匙/个扇贝），葱切细花，姜切细丝',
      '每个扇贝上先铺一小撮粉丝（约15克），再放上蒜末、姜丝',
      '蒸锅水开后（约100度），将扇贝放入，中火蒸制8-10分钟',
      '取出后立即淋上1茶匙热油和生抽，撒上葱花',
      '最后可以淋上少许香油（约1/4茶匙）提香'
    ],
    nutrition: {
      calories: '180大卡/100克',
      protein: '15克/100克',
      carbs: '20克/100克'
    }
  },
  {
    id: 608,
    name: '佛跳墙',
    image: '/images/dishes/fotiaoqiang.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.SEAFOOD,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BRAISED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.HARD,
    cookingTime: '180分钟',
    ingredients: ['鱼翅', '鲍鱼', '海参', '花胶', '瑶柱', '火腿', '鸡汤'],
    steps: [
      '海参提前浸泡24小时，鱼翅浸泡12小时，鲍鱼浸泡6小时至软糯',
      '准备高汤：鸡骨和猪骨慢炖3小时，去除浮沫，最终得到清亮高汤约1000ml',
      '砂锅底部先铺上切片的金华火腿（约50克）',
      '依次放入处理好的鲍鱼、海参、鱼翅、花胶，每层之间加入适量瑶柱提鲜',
      '倒入准备好的高汤，确保没过所有食材2厘米',
      '大火烧开后转小火，盖上锅盖慢炖3小时，期间不要翻动食材',
      '中途可适当添加热高汤，保持汤汁始终没过食材',
      '最后加入适量盐（约1茶匙）和胡椒粉调味，焖煮10分钟即可'
    ],
    nutrition: {
      calories: '300大卡/100克',
      protein: '35克/100克',
      collagen: '丰富'
    }
  },
  {
    id: 609,
    name: '北京烤鸭',
    image: '/images/dishes/kaoya.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.MEAT,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.ROASTED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.HARD,
    cookingTime: '90分钟',
    ingredients: ['鸭子', '葱', '甜面酱', '薄饼', '黄瓜', '大葱'],
    steps: [
      '选用3-4斤重的整鸭，清洗干净后用厨房纸彻底擦干',
      '鸭身内外涂抹料酒（约30ml）、姜片去腥，腌制1小时',
      '锅中加入开水，放入姜片、葱段，将鸭子焯烫1分钟去腥',
      '取出后用厨房纸擦干，涂抹一层蜂蜜水（蜂蜜:热水=1:2）',
      '将鸭子挂在通风处晾干4小时，期间每隔1小时刷一次蜂蜜水',
      '烤箱预热至200度，将鸭子挂入烤箱中层',
      '烤制45分钟，期间每15分钟翻面一次，刷油防止皮干',
      '最后调至230度烤5分钟，使鸭皮酥脆',
      '趁热片皮，配以温热的薄饼、甜面酱、葱丝（约5cm长）、黄瓜丝食用'
    ],
    nutrition: {
      calories: '350大卡/100克',
      protein: '28克/100克',
      fat: '25克/100克'
    }
  }
]

// 更新早餐类
const BREAKFAST_DISHES = [
  {
    id: 701,
    name: '生煎包',
    image: '/images/dishes/shengjianbao.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.BREAKFAST,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.PAN_FRIED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '30分钟',
    ingredients: ['面粉', '猪肉馅', '葱姜', '料酒', '生抽', '盐'],
    steps: [
      '面团制作：中筋面粉300克加入温水（35度）160ml，揉成光滑面团，醒发30分钟',
      '馅料制作：猪肉馅200克加入葱姜末、料酒、生抽、盐腌制15分钟，加入少许高汤（约30ml）调馅',
      '将面团分成30克一个的小剂子，擀成中间厚、边缘薄的圆皮',
      '包入适量馅料（约20克），捏紧褶皱，收口朝上',
      '平底锅刷一层薄油，中小火将生煎包底部煎至金黄，约3分钟',
      '加入温水没过生煎包底部三分之一（约3mm），盖上锅盖焖煮5分钟',
      '待水分收干后，转中火煎至底部酥脆，约2分钟',
      '出锅后撒上芝麻和葱花点缀，趁热食用'
    ],
    nutrition: {
      calories: '220大卡/100克',
      protein: '8克/100克',
      carbs: '30克/100克'
    }
  },
  {
    id: 702,
    name: '葱油饼',
    image: '/images/dishes/congyoubing.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.BREAKFAST,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.PAN_FRIED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
    cookingTime: '20分钟',
    ingredients: ['面粉', '葱花', '油', '盐'],
    steps: [
      '面团制作：中筋面粉250克加入温水（35度）120ml和盐3克，揉成光滑面团，醒发20分钟',
      '葱花切碎（约1大把），沥干水分备用',
      '将面团擀成薄片（约2mm厚），刷上一层油',
      '均匀撒上葱花和适量盐，从一端卷起成卷',
      '将卷成的面团对折，再次擀成椭圆形（约3mm厚）',
      '锅中油温5成热（约150度），放入饼胚',
      '中火煎至两面金黄酥脆，每面约2-3分钟',
      '出锅后趁热切块食用，确保层次分明，外酥内软'
    ],
    nutrition: {
      calories: '250大卡/100克',
      carbs: '35克/100克',
      fat: '12克/100克'
    }
  },
  {
    id: 703,
    name: '肠粉',
    image: '/images/dishes/changfen.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.BREAKFAST,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.STEAMED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '30分钟',
    ingredients: ['粘米粉', '淀粉', '叉烧肉', '韭黄', '生抽', '芝麻酱'],
    steps: [
      '粘米粉200克和淀粉50克调制成面糊，加入温水350ml搅拌均匀，静置15分钟',
      '叉烧肉切丝（约2mm宽），韭黄切段（约3cm长）',
      '将面糊过筛确保无颗粒，调至牛奶般稠度',
      '蒸盘刷油，舀入适量面糊摊成薄片（约1mm厚）',
      '大火蒸1分钟，表面呈半透明状',
      '放入叉烧肉丝和韭黄，轻轻卷起',
      '切成4cm长的段，摆盘',
      '淋上调好的酱汁（生抽、蒜蓉、芝麻酱调制），趁热食用'
    ],
    nutrition: {
      calories: '180大卡/100克',
      protein: '6克/100克',
      carbs: '30克/100克'
    }
  },
  {
    id: 704,
    name: '小笼包',
    image: '/images/dishes/xiaolongbao.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.BREAKFAST,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.STEAMED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.HARD,
    cookingTime: '45分钟',
    ingredients: ['面粉', '猪肉', '虾仁', '葱姜', '料酒', '高汤'],
    steps: [
      '面团制作：中筋面粉300克加入温水（40度）150ml，揉成光滑面团，醒发30分钟',
      '馅料准备：猪肉馅200克剁细，虾仁50克切碎，加入葱姜末、料酒、生抽腌制',
      '高汤准备：猪骨熬制的高汤冷却后成胶状（约200ml），加入馅料中',
      '将面团分成25克小团，擀成中间稍厚、边缘薄的圆皮（约0.8mm厚）',
      '包入约20克馅料，捏制18个褶皱，顶部封口需紧实',
      '笼屉刷油，垫上湿润的纱布或油纸',
      '将小笼包间隔摆放，预留膨胀空间',
      '大火将水烧开后，转中火蒸制8分钟',
      '关火后等待30秒再揭盖，避免皮破汤漏',
      '蘸醋或配以姜丝，趁热食用'
    ],
    nutrition: {
      calories: '200大卡/100克',
      protein: '10克/100克',
      carbs: '25克/100克'
    }
  },
  {
    id: 705,
    name: '馄饨',
    image: '/images/dishes/huntun.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.BREAKFAST,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BOILED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '30分钟',
    ingredients: ['馄饨皮', '猪肉末', '虾仁', '葱姜', '高汤', '香油'],
    steps: [
      '馅料制作：猪肉末200克、虾仁50克剁碎，加入葱姜末、料酒、生抽、盐腌制15分钟',
      '加入少许香油和淀粉调匀，使馅料更有韧性',
      '取一片馄饨皮，放入约1茶匙（10克）馅料',
      '沾水封边，捏合成三角形，再将两角并拢',
      '准备高汤：加入葱段、姜片，小火炖煮10分钟',
      '将高汤调味：加入适量盐、胡椒粉、香油',
      '锅中水开后，将馄饨轻轻放入，中火煮至浮起（约3-4分钟）',
      '盛入碗中，加入热高汤，撒上葱花、香菜',
      '可根据个人喜好加入醋、辣油调味'
    ],
    nutrition: {
      calories: '160大卡/100克',
      protein: '8克/100克',
      carbs: '20克/100克'
    }
  }
]

// 更新小吃类
const SNACK_DISHES = [
  {
    id: 801,
    name: '炸春卷',
    image: '/images/dishes/zhachunjuan.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.SNACK,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.DEEP_FRIED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '40分钟',
    ingredients: ['春卷皮', '猪肉末', '胡萝卜', '豆芽', '木耳', '葱姜'],
    steps: [
      '准备馅料：猪肉末150克加入料酒、生抽腌制10分钟',
      '胡萝卜切细丝（2mm粗细），豆芽洗净，木耳泡发切丝，葱姜切末',
      '锅中油温5成热，放入猪肉末炒散，加入胡萝卜丝翻炒2分钟',
      '加入豆芽、木耳翻炒3分钟，加盐调味，放凉备用',
      '取一张春卷皮，放入约2汤匙馅料，折叠两边，卷起收口',
      '封口处刷一层水粉糊（面粉加水调制）粘紧',
      '油温烧至7成热（约180度），将春卷放入炸至金黄，约3-4分钟',
      '捞出沥油，切斜片趁热食用，可蘸甜辣酱'
    ],
    nutrition: {
      calories: '180大卡/100克',
      protein: '6克/100克',
      fat: '10克/100克'
    }
  },
  {
    id: 802,
    name: '锅贴',
    image: '/images/dishes/guotie.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.SNACK,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.PAN_FRIED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '35分钟',
    ingredients: ['面粉', '猪肉馅', '白菜', '葱姜', '料酒', '生抽'],
    steps: [
      '面团制作：中筋面粉300克加入温水（40度）150ml，揉成光滑面团，醒发20分钟',
      '馅料制作：猪肉馅200克加入葱姜末、料酒、生抽、盐腌制15分钟',
      '白菜切碎，焯烫沥干水分后加入馅料中，搅拌均匀',
      '将面团分成30克小团，擀成圆形薄皮（边缘略薄）',
      '包入适量馅料（约25克），捏出褶皱，底部压平',
      '平底锅刷油预热，摆入锅贴，小火煎至底部金黄（约3分钟）',
      '加入温水没过锅贴底部1/3处，盖盖中火焖煮5分钟',
      '待水分收干后，转小火煎至底部酥脆，约2分钟',
      '出锅后蘸醋食用，趁热享用最佳'
    ],
    nutrition: {
      calories: '200大卡/100克',
      protein: '7克/100克',
      carbs: '25克/100克'
    }
  },
  {
    id: 803,
    name: '煎饺',
    image: '/images/dishes/jianjiao.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.SNACK,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.PAN_FRIED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '30分钟',
    ingredients: ['饺子皮', '猪肉馅', '白菜', '葱姜', '料酒', '生抽'],
    steps: [
      '馅料制作：猪肉馅200克加入葱姜末、料酒、生抽、盐腌制15分钟',
      '白菜切碎，加入适量盐腌制10分钟，挤干水分',
      '将腌制好的白菜加入肉馅中，搅拌均匀',
      '取一片饺子皮，放入约1汤匙馅料（约20克）',
      '沾水封边，捏出褶皱，底部压平',
      '平底锅刷油预热，摆入饺子，小火煎至底部金黄（约3分钟）',
      '加入温水没过饺子底部1/3处，盖盖中火焖煮4分钟',
      '待水分收干后，继续小火煎至底部酥脆，约2分钟',
      '配以醋、蒜末、辣油，趁热食用'
    ],
    nutrition: {
      calories: '220大卡/100克',
      protein: '8克/100克',
      carbs: '28克/100克'
    }
  },
  {
    id: 804,
    name: '炸鸡翅',
    image: '/images/dishes/zhajichi.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.SNACK,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.DEEP_FRIED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '40分钟',
    ingredients: ['鸡翅', '料酒', '生抽', '淀粉', '蒜粉', '辣椒粉'],
    steps: [
      '鸡翅洗净，用厨房纸擦干，每个翅中间划两刀',
      '腌制料调制：料酒30ml、生抽20ml、蒜粉5g、盐5g、白胡椒粉3g',
      '将鸡翅放入腌制料中，充分按摩，腌制30分钟',
      '准备裹粉：淀粉100g中加入辣椒粉5g、蒜粉3g、盐3g混合均匀',
      '将腌制好的鸡翅裹上调味淀粉，轻拍去除多余粉',
      '油温烧至7成热（约180度），放入鸡翅',
      '中火炸制5-6分钟至金黄，捞出沥油1分钟',
      '再次将油温升至8成热（约190度），复炸1-2分钟至外皮酥脆',
      '捞出沥油，撒上辣椒粉、孜然粉，趁热食用'
    ],
    nutrition: {
      calories: '280大卡/100克',
      protein: '20克/100克',
      fat: '18克/100克'
    }
  }
]

// 添加凉菜类
const COLD_DISHES = [
  {
    id: 901,
    name: '口水鸡',
    image: '/images/dishes/koushuiji.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.COLD_DISH,
    taste: DISH_CHARACTERISTICS.TASTES.SPICY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BOILED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '40分钟',
    ingredients: ['鸡肉', '花生碎', '芝麻', '辣椒油', '花椒', '蒜', '生抽'],
    steps: [
      '选用三黄鸡（约1.5斤），清洗干净，沥干水分',
      '锅中加入葱段、姜片、料酒，冷水没过鸡肉',
      '大火烧开后转中小火煮20分钟，关火焖5分钟',
      '将鸡肉取出，立即放入冰水中浸泡10分钟，保持爽滑',
      '调制料汁：蒜末2汤匙、花椒粉1茶匙、辣椒油3汤匙、生抽2汤匙、醋1汤匙',
      '将鸡肉切成薄片（约0.3cm），摆盘',
      '均匀浇上料汁，撒上花生碎（约2汤匙）和芝麻（约1茶匙）',
      '最后撒上葱花和香菜点缀'
    ],
    nutrition: {
      calories: '200大卡/100克',
      protein: '25克/100克',
      fat: '12克/100克'
    }
  },
  {
    id: 902,
    name: '凉拌海蜇',
    image: '/images/dishes/haizhe.jpg',
    category: DISH_CHARACTERISTICS.CATEGORIES.COLD_DISH,
    taste: DISH_CHARACTERISTICS.TASTES.SAVORY,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.COLD_MIXED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
    cookingTime: '15分钟',
    ingredients: ['海蜇', '醋', '蒜', '香油', '生抽', '辣椒油'],
    steps: [
      '海蜇提前用清水浸泡2小时，去除多余盐分',
      '切成细丝（约2mm宽），沥干水分',
      '蒜切末（约1汤匙），香菜切段',
      '调制料汁：醋2汤匙、生抽1汤匙、香油1茶匙、辣椒油适量',
      '将海蜇丝放入碗中，加入蒜末和料汁',
      '轻轻拌匀，避免海蜇丝断裂',
      '最后撒上香菜，放入冰箱冷藏15分钟后食用更爽脆'
    ],
    nutrition: {
      calories: '60大卡/100克',
      protein: '5克/100克',
      minerals: '碘, 钙'
    }
  }
]

// 添加甜点类
const DESSERT_DISHES = [
  {
    id: 1001,
    name: '桂花糯米藕',
    image: '/images/dishes/guihuaou.jpg',
    category: 'DESSERT',
    taste: DISH_CHARACTERISTICS.TASTES.SWEET,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.STEAMED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.NORMAL,
    cookingTime: '60分钟',
    ingredients: ['莲藕', '糯米', '桂花', '糖'],
    steps: [
      '莲藕选用新鲜藕节（约20cm长），去皮洗净',
      '糯米提前浸泡4小时，沥干水分',
      '将糯米加入适量盐（约1/4茶匙）调味，搅拌均匀',
      '用筷子将糯米一点点塞入藕孔，确保填实',
      '蒸锅水开后，将糯米藕放入',
      '大火蒸40分钟，期间翻面1-2次',
      '取出后晾凉5分钟，切成1cm厚的圆片',
      '撒上桂花酱（约2汤匙）和糖粉（约1汤匙）即可',
      '可以搭配一碗温热的糖水食用更佳'
    ],
    nutrition: {
      calories: '180大卡/100克',
      carbs: '35克/100克',
      fiber: '2克/100克'
    }
  },
  {
    id: 1002,
    name: '红豆沙',
    image: '/images/dishes/hongdousha.jpg',
    category: 'DESSERT',
    taste: DISH_CHARACTERISTICS.TASTES.SWEET,
    cookingMethod: DISH_CHARACTERISTICS.COOKING_METHODS.BOILED,
    difficulty: DISH_CHARACTERISTICS.DIFFICULTY.EASY,
    cookingTime: '90分钟',
    ingredients: ['红豆', '糖', '桂圆'],
    steps: [
      '红豆（500g）提前浸泡8小时，沥干水分',
      '锅中加入清水（约2000ml），放入红豆',
      '大火烧开后转小火，加入桂圆（约50g）',
      '慢炖60分钟，期间注意补充热水',
      '用勺子压碎部分红豆，使其糊化',
      '加入白糖（约150g），继续小火煮15分钟',
      '不断搅拌，直至红豆沙浓稠粘稠',
      '关火前加入少许盐（约1/4茶匙）提味',
      '晾凉后装入密封容器，冷藏保存',
      '食用时可以加入熟糯米、芋圆或搭配面包'
    ],
    nutrition: {
      calories: '150大卡/100克',
      protein: '5克/100克',
      fiber: '3克/100克'
    }
  }
]

// 更新ALL_DISHES
const ALL_DISHES = {
  ...PAIRING_DISHES,
  ...STAPLE_DISHES,
  ...MEAT_DISHES,
  ...SEAFOOD_DISHES,
  ...VEGETABLE_DISHES,
  SOUP_DISHES,
  SPECIALTY_DISHES,
  BREAKFAST_DISHES,
  SNACK_DISHES,
  COLD_DISHES,
  DESSERT_DISHES
}

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    recipes: [],
    currentRecipe: null,
    recommendedPairings: [],
    usedPairings: new Set(), // 记录已推荐过的搭配
    allDishes: ALL_DISHES,
    todayRecommends: [], // 今日推荐列表
    homePageRecipe: null, // 首页随机推荐的菜品
    homePageRecommends: [] // 首页今日推荐列表
  }),
  
  actions: {
    /**
     * 获取首页随机推荐
     */
    async getHomePageRecipe() {
      const recipe = await this.getRandomRecipe()
      this.homePageRecipe = recipe
      return this.homePageRecipe
    },

    /**
     * 获取首页今日推荐
     */
    async getHomePageRecommends() {
      if (this.homePageRecommends.length === 0) {
        this.homePageRecommends = await this.getTodayRecommends()
      }
      return this.homePageRecommends
    },

    /**
     * 重置首页推荐
     */
    resetHomePageRecipe() {
      this.homePageRecipe = null
    },

    /**
     * 获取随机推荐的食谱
     * @returns {Object} 随机选择的菜品
     */
    async getRandomRecipe() {
      // 将所有菜品整理成一个数组
      const allDishesArray = [
        ...Object.values(STAPLE_DISHES.RICE_DISHES),
        ...Object.values(STAPLE_DISHES.NOODLE_DISHES),
        ...Object.values(MEAT_DISHES.PORK_DISHES),
        ...Object.values(MEAT_DISHES.CHICKEN_DISHES),
        ...Object.values(SEAFOOD_DISHES.FISH_DISHES),
        ...Object.values(SEAFOOD_DISHES.SHRIMP_DISHES),
        ...Object.values(VEGETABLE_DISHES.LEAFY_GREENS),
        ...Object.values(VEGETABLE_DISHES.MUSHROOMS),
        ...Object.values(VEGETABLE_DISHES.ROOT_VEGETABLES),
        ...Object.values(VEGETABLE_DISHES.BEAN_SPROUTS),
        ...SOUP_DISHES,
        ...SPECIALTY_DISHES,
        ...BREAKFAST_DISHES,
        ...SNACK_DISHES,
        ...COLD_DISHES,
        ...DESSERT_DISHES
      ]

      // 随机选择一道菜
      const randomIndex = Math.floor(Math.random() * allDishesArray.length)
      this.currentRecipe = allDishesArray[randomIndex]

      return this.currentRecipe
    },

    /**
     * 获取今日推荐菜品列表
     * @returns {Array} 推荐的菜品列表
     */
    async getTodayRecommends() {
      // 将所有菜品整理成一个数组
      const allDishesArray = [
        ...Object.values(STAPLE_DISHES.RICE_DISHES),
        ...Object.values(STAPLE_DISHES.NOODLE_DISHES),
        ...Object.values(MEAT_DISHES.PORK_DISHES),
        ...Object.values(MEAT_DISHES.CHICKEN_DISHES),
        ...Object.values(SEAFOOD_DISHES.FISH_DISHES),
        ...Object.values(SEAFOOD_DISHES.SHRIMP_DISHES),
        ...Object.values(VEGETABLE_DISHES.LEAFY_GREENS),
        ...Object.values(VEGETABLE_DISHES.MUSHROOMS),
        ...Object.values(VEGETABLE_DISHES.ROOT_VEGETABLES),
        ...Object.values(VEGETABLE_DISHES.BEAN_SPROUTS),
        ...SOUP_DISHES,
        ...SPECIALTY_DISHES,
        ...BREAKFAST_DISHES,
        ...SNACK_DISHES,
        ...COLD_DISHES,
        ...DESSERT_DISHES
      ]

      // 清空今日推荐列表
      this.todayRecommends = []

      // 随机选择6道不重复的菜
      const selectedDishes = new Set()
      const recommendCount = 6

      while (selectedDishes.size < recommendCount && selectedDishes.size < allDishesArray.length) {
        const randomIndex = Math.floor(Math.random() * allDishesArray.length)
        const dish = allDishesArray[randomIndex]
        if (!selectedDishes.has(dish.id)) {
          selectedDishes.add(dish.id)
          this.todayRecommends.push(dish)
        }
      }

      // 确保推荐的菜品类型多样
      this.todayRecommends.sort((a, b) => {
        // 按照类别排序，使得不同类别的菜品分散显示
        const categoryOrder = {
          [DISH_CHARACTERISTICS.CATEGORIES.STAPLE]: 1,
          [DISH_CHARACTERISTICS.CATEGORIES.MEAT]: 2,
          [DISH_CHARACTERISTICS.CATEGORIES.SEAFOOD]: 3,
          [DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE]: 4,
          [DISH_CHARACTERISTICS.CATEGORIES.SOUP]: 5,
          'DESSERT': 6
        }
        return categoryOrder[a.category] - categoryOrder[b.category]
      })

      return this.todayRecommends
    },

    /**
     * 根据当前菜品特点，推荐搭配的菜品
     * @param {number} recipeId - 当前菜品ID
     */
    async getRecommendedPairings(recipeId) {
      const currentDish = this.currentRecipe
      if (!currentDish) return

      const pairings = []
      this.usedPairings.clear() // 清空已使用记录

      // 根据口味和烹饪方式推荐搭配
      if (currentDish.taste === DISH_CHARACTERISTICS.TASTES.SPICY || 
          currentDish.taste === DISH_CHARACTERISTICS.TASTES.SALTY) {
        // 如果是重口味菜品，推荐清淡的搭配
        const lightDishes = [
          ...Object.values(VEGETABLE_DISHES.LEAFY_GREENS),
          ...Object.values(VEGETABLE_DISHES.BEAN_SPROUTS)
        ].filter(dish => dish.taste === DISH_CHARACTERISTICS.TASTES.LIGHT)
        
        if (lightDishes.length > 0) {
          const randomIndex = Math.floor(Math.random() * lightDishes.length)
          pairings.push(lightDishes[randomIndex])
        }
      }

      // 根据菜品类别推荐搭配
      if (currentDish.category === DISH_CHARACTERISTICS.CATEGORIES.MEAT) {
        // 如果是荤菜，推荐素菜
        const vegetableDishes = [
          ...Object.values(VEGETABLE_DISHES.LEAFY_GREENS),
          ...Object.values(VEGETABLE_DISHES.MUSHROOMS),
          ...Object.values(VEGETABLE_DISHES.ROOT_VEGETABLES),
          ...Object.values(VEGETABLE_DISHES.BEAN_SPROUTS)
        ]
        
        if (vegetableDishes.length > 0) {
          const randomIndex = Math.floor(Math.random() * vegetableDishes.length)
          const dish = vegetableDishes[randomIndex]
          if (!pairings.find(p => p.id === dish.id)) {
            pairings.push(dish)
          }
        }
      } else if (currentDish.category === DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE) {
        // 如果是素菜，可以推荐荤菜
        const meatDishes = [
          ...Object.values(MEAT_DISHES.PORK_DISHES),
          ...Object.values(MEAT_DISHES.CHICKEN_DISHES)
        ]
        
        if (meatDishes.length > 0) {
          const randomIndex = Math.floor(Math.random() * meatDishes.length)
          pairings.push(meatDishes[randomIndex])
        }
      }

      // 确保至少有两个推荐
      if (pairings.length < 2) {
        const allDishes = [
          ...Object.values(VEGETABLE_DISHES.LEAFY_GREENS),
          ...Object.values(VEGETABLE_DISHES.MUSHROOMS),
          ...Object.values(VEGETABLE_DISHES.ROOT_VEGETABLES),
          ...Object.values(VEGETABLE_DISHES.BEAN_SPROUTS),
          ...Object.values(MEAT_DISHES.PORK_DISHES),
          ...Object.values(MEAT_DISHES.CHICKEN_DISHES)
        ].filter(dish => dish.id !== currentDish.id && !pairings.find(p => p.id === dish.id))

        while (pairings.length < 2 && allDishes.length > 0) {
          const randomIndex = Math.floor(Math.random() * allDishes.length)
          pairings.push(allDishes[randomIndex])
          allDishes.splice(randomIndex, 1)
        }
      }

      this.recommendedPairings = pairings
      return this.recommendedPairings
    },

    /**
     * 从指定菜品列表中随机选择一道未推荐过的菜
     * @param {Array} dishes - 备选菜品列表
     * @returns {Object} 选中的菜品
     */
    getRandomDish(dishes) {
      const availableDishes = dishes.filter(dish => !this.usedPairings.has(dish.id))
      if (availableDishes.length === 0) return null

      const randomIndex = Math.floor(Math.random() * availableDishes.length)
      const selectedDish = availableDishes[randomIndex]
      this.usedPairings.add(selectedDish.id)
      return selectedDish
    },

    /**
     * 根据关键词搜索食谱
     * @param {string} keyword - 搜索关键词
     */
    async searchRecipes(keyword) {
      if (!keyword) {
        this.recipes = []
        return
      }

      // 将所有菜品整理成一个数组
      const allDishesArray = [
        ...Object.values(STAPLE_DISHES.RICE_DISHES),
        ...Object.values(STAPLE_DISHES.NOODLE_DISHES),
        ...Object.values(MEAT_DISHES.PORK_DISHES),
        ...Object.values(MEAT_DISHES.CHICKEN_DISHES),
        ...Object.values(SEAFOOD_DISHES.FISH_DISHES),
        ...Object.values(SEAFOOD_DISHES.SHRIMP_DISHES),
        ...Object.values(VEGETABLE_DISHES.LEAFY_GREENS),
        ...Object.values(VEGETABLE_DISHES.MUSHROOMS),
        ...Object.values(VEGETABLE_DISHES.ROOT_VEGETABLES),
        ...Object.values(VEGETABLE_DISHES.BEAN_SPROUTS),
        ...SOUP_DISHES,
        ...SPECIALTY_DISHES,
        ...BREAKFAST_DISHES,
        ...SNACK_DISHES,
        ...COLD_DISHES,
        ...DESSERT_DISHES
      ]

      // 搜索逻辑:
      // 1. 匹配菜品名称
      // 2. 匹配食材列表
      // 3. 匹配烹饪方法
      const searchResults = allDishesArray.filter(dish => {
        const lowerKeyword = keyword.toLowerCase()
        return (
          // 匹配菜品名称
          dish.name.toLowerCase().includes(lowerKeyword) ||
          // 匹配食材列表
          dish.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(lowerKeyword)
          ) ||
          // 匹配烹饪方法
          dish.cookingMethod.toLowerCase().includes(lowerKeyword)
        )
      })

      this.recipes = searchResults
      return searchResults
    },

    /**
     * 根据ID获取菜品
     * @param {number} id - 菜品ID
     * @returns {Object} 菜品详情
     */
    async getRecipeById(id) {
      // 遍历所有菜品分类
      const allDishesArray = [
        ...Object.values(STAPLE_DISHES.RICE_DISHES),
        ...Object.values(STAPLE_DISHES.NOODLE_DISHES),
        ...Object.values(MEAT_DISHES.PORK_DISHES),
        ...Object.values(MEAT_DISHES.CHICKEN_DISHES),
        ...Object.values(SEAFOOD_DISHES.FISH_DISHES),
        ...Object.values(SEAFOOD_DISHES.SHRIMP_DISHES),
        ...Object.values(VEGETABLE_DISHES.LEAFY_GREENS),
        ...Object.values(VEGETABLE_DISHES.MUSHROOMS),
        ...Object.values(VEGETABLE_DISHES.ROOT_VEGETABLES),
        ...Object.values(VEGETABLE_DISHES.BEAN_SPROUTS),
        ...SOUP_DISHES,
        ...SPECIALTY_DISHES,
        ...BREAKFAST_DISHES,
        ...SNACK_DISHES,
        ...COLD_DISHES,
        ...DESSERT_DISHES
      ]

      // 查找匹配ID的菜品
      const recipe = allDishesArray.find(dish => dish.id === id)
      if (!recipe) {
        throw new Error('未找到该菜品')
      }

      this.currentRecipe = recipe
      return recipe
    }
  }
}) 