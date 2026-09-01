import { describe, expect, it } from 'vitest'
import { getStepTips, highlightStepValues } from './recipe-step'

describe('recipe step presentation', () => {
  it('escapes imported text before adding value highlights', () => {
    const result = highlightStepValues('<img src=x> 加热 10 分钟')
    expect(result).toContain('&lt;img src=x&gt;')
    expect(result).toContain('<span class="highlight-time">10分钟</span>')
    expect(result).not.toContain('<img')
  })

  it('returns focused safety tips only when relevant', () => {
    expect(getStepTips('油温升高后放入食材')).toContain('油花飞溅')
    expect(getStepTips('装盘即可')).toBeNull()
  })
})
