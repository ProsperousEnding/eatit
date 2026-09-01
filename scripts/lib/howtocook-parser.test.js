import { describe, expect, it } from 'vitest'
import {
  getCalories,
  getCookingTime,
  getDifficulty,
  getServingDescription,
  getVideoTutorialPlatforms,
  parseIngredients,
  parsePreparation,
  parseSteps,
  parseTools,
  parseVideoTutorials
} from '../import-howtocook.mjs'

const recipeMarkdown = `# 测试菜的做法

预估烹饪难度：★★
预估烹饪时间：1 小时 20 分钟
预估卡路里：520 大卡

## 必备原料和工具

- 鸡腿 + 生抽
- 炒锅
- 厨房纸
- 调料：

## 计算

每份正好够 2 人食用

- 鸡腿 = 350g
- 生抽 10ml
- 香菜（可选，按口味）
- 洋葱

## 操作

先处理食材。

1. 鸡腿切成 2cm 小块。
2. 加入生抽拌匀：
   - 冷藏 10 分钟
3. 下锅炒熟。![步骤图](step.jpg)

## 附加内容

[有效视频](https://www.bilibili.com/video/BV1oF411F7wD?share=1)
[重复视频](https://www.bilibili.com/video/BV1oF411F7wD)
[已拒绝视频](https://www.bilibili.com/video/BV1g541177cd)
`

describe('HowToCook parser', () => {
  it('separates ingredients and tools', () => {
    expect(parseIngredients(recipeMarkdown)).toEqual(['鸡腿', '生抽'])
    expect(parseTools(recipeMarkdown)).toEqual(['炒锅', '厨房纸'])
  })

  it('normalizes quantified preparation without inventing amounts', () => {
    expect(parsePreparation(recipeMarkdown)).toEqual([
      '鸡腿：350g',
      '生抽 10ml',
      '香菜（可选，按口味）',
      '洋葱（上游未标明用量）'
    ])
    expect(getServingDescription(recipeMarkdown)).toBe('每份正好够 2 人食用')
  })

  it('keeps numbered steps, nested instructions and context', () => {
    expect(parseSteps(recipeMarkdown)).toEqual([
      '先处理食材。 鸡腿切成 2cm 小块。',
      '加入生抽拌匀：冷藏 10 分钟',
      '下锅炒熟。'
    ])
  })

  it('normalizes and audits video references', () => {
    const references = parseVideoTutorials(recipeMarkdown)
    expect(references).toEqual([{
      title: '冬瓜酿肉家常做法',
      url: 'https://www.bilibili.com/video/BV1oF411F7wD',
      platform: 'bilibili',
      source: 'HowToCook 上游参考'
    }])
    expect(getVideoTutorialPlatforms('测试菜', references).map(platform => platform.key))
      .toEqual(['bilibili', 'douyin'])
  })

  it('parses time, difficulty and calories', () => {
    expect(getCookingTime(recipeMarkdown, [])).toBe('80分钟')
    expect(getDifficulty(recipeMarkdown)).toBe('简单')
    expect(getCalories(recipeMarkdown)).toEqual({ calories: '520 大卡' })
  })
})
