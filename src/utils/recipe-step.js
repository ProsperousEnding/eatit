const escapeHtml = (text) => text
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const unitClasses = {
  '分钟': 'highlight-time', '秒钟': 'highlight-time', '小时': 'highlight-time',
  '分': 'highlight-time', '秒': 'highlight-time', h: 'highlight-time', min: 'highlight-time', s: 'highlight-time',
  '厘米': 'highlight-length', '毫米': 'highlight-length', cm: 'highlight-length', mm: 'highlight-length',
  '米': 'highlight-length', m: 'highlight-length',
  '度': 'highlight-temp', '℃': 'highlight-temp', '°C': 'highlight-temp', '°F': 'highlight-temp',
  '千克': 'highlight-weight', '公斤': 'highlight-weight', kg: 'highlight-weight',
  '克': 'highlight-weight', g: 'highlight-weight', '斤': 'highlight-weight', '两': 'highlight-weight',
  '毫升': 'highlight-volume', '分升': 'highlight-volume', ml: 'highlight-volume', dl: 'highlight-volume',
  '升': 'highlight-volume', L: 'highlight-volume', l: 'highlight-volume',
  '茶匙': 'highlight-measure', '汤匙': 'highlight-measure', '勺子': 'highlight-measure',
  '大勺': 'highlight-measure', '小勺': 'highlight-measure', cup: 'highlight-measure',
  tbsp: 'highlight-measure', tsp: 'highlight-measure', '勺': 'highlight-measure', '碗': 'highlight-measure',
  '杯': 'highlight-measure', '盘': 'highlight-measure', '撮': 'highlight-measure', '匙': 'highlight-measure',
  '个': 'highlight-quantity', '只': 'highlight-quantity', '块': 'highlight-quantity', '片': 'highlight-quantity',
  '颗': 'highlight-quantity', '粒': 'highlight-quantity', '根': 'highlight-quantity', '条': 'highlight-quantity',
  '串': 'highlight-quantity', '包': 'highlight-quantity', '瓣': 'highlight-quantity', '节': 'highlight-quantity',
  '头': 'highlight-quantity', '朵': 'highlight-quantity', '丝': 'highlight-quantity', '段': 'highlight-quantity',
  '张': 'highlight-quantity', '捆': 'highlight-quantity', '把': 'highlight-quantity', '束': 'highlight-quantity'
}

const valueWithUnitPattern = /(\d+(?:\.\d+)?)\s*(分钟|秒钟|小时|min|厘米|毫米|cm|mm|毫升|分升|ml|dl|千克|公斤|kg|茶匙|汤匙|勺子|大勺|小勺|tbsp|tsp|cup|°C|°F|℃|分|秒|h|s|米|m|度|克|g|斤|两|升|L|l|勺|碗|杯|盘|撮|匙|个|只|块|片|颗|粒|根|条|串|包|瓣|节|头|朵|丝|段|张|捆|把|束)/g

export const highlightStepValues = (text) => escapeHtml(text).replace(
  valueWithUnitPattern,
  (_, value, unit) => `<span class="${unitClasses[unit]}">${value}${unit}</span>`
)

export const getStepTips = (step) => {
  if (/热油|油温|油炸/.test(step)) return '操作热油时保持食材表面干燥，注意防止油花飞溅。'
  if (/大火烧开|保持大火/.test(step)) return '留意锅内状态，沸腾后及时按步骤调整火力。'
  if (/腌制/.test(step)) return '腌制食材请冷藏保存，并与即食食材分开处理。'
  return null
}
