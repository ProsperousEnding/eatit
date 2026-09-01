<template>
  <section class="not-found" aria-labelledby="not-found-title">
    <p class="status-code">404</p>
    <h1 id="not-found-title">页面不存在</h1>
    <p>这个地址可能已经失效，您可以返回首页重新选择菜品。</p>
    <router-link class="home-link" to="/">返回首页</router-link>
  </section>
</template>

<style scoped>
.not-found {
  min-height: calc(100vh - 116px);
  padding: 80px 24px;
  box-sizing: border-box;
  text-align: center;
  color: #303133;
}

.status-code {
  margin: 0;
  color: #a63232;
  font-size: 48px;
  font-weight: 700;
}

.not-found h1 {
  margin: 12px 0;
  font-size: 28px;
}

.not-found > p:last-of-type {
  margin-bottom: 28px;
  color: #595959;
}

.home-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 18px;
  border-radius: 6px;
  color: #fff;
  background: #1769aa;
  text-decoration: none;
}

.home-link:focus-visible {
  outline: 3px solid #1769aa;
  outline-offset: 3px;
}
</style>
