<template>
  <el-container class="layout-container">
      <router-view></router-view>
    
    <el-footer>
      <p>© 2024 EatIt - 今天吃什么</p>
    </el-footer>
  </el-container>
</template>

<script setup>
// 组件逻辑
</script>

<style>
.layout-container {
  min-height: 100vh;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 20px;
}

nav {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.el-footer {
  text-align: center;
  color: #666;
}
</style> 