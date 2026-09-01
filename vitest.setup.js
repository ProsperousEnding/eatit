if (typeof window !== 'undefined') {
  const values = new Map()
  const memoryStorage = {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key) {
      return values.has(String(key)) ? values.get(String(key)) : null
    },
    key(index) {
      return [...values.keys()][index] ?? null
    },
    removeItem(key) {
      values.delete(String(key))
    },
    setItem(key, value) {
      values.set(String(key), String(value))
    }
  }

  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage,
    configurable: true
  })
  Object.defineProperty(window, 'localStorage', {
    value: memoryStorage,
    configurable: true
  })
}
