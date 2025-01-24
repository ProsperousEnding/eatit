# EatIt (今天吃什么) 🍽️

When you don't know what you want to eat and cook, just eat it.

## 项目简介

EatIt是一个帮助用户解决"今天吃什么"困扰的Web应用。通过智能推荐和搜索功能，用户可以快速找到感兴趣的菜品，查看详细的制作方法和营养信息，并获得合理的菜品搭配建议。

## 功能特点 ✨

- **智能推荐**: 首页随机推荐美味菜品
- **菜品详情**: 提供详细的食材清单、制作步骤和营养成分信息
- **搭配建议**: 智能推荐营养均衡的菜品搭配
- **食材搜索**: 根据已有食材快速查找可制作的菜品

## 技术栈 🛠️

- Vue 3.js - 渐进式JavaScript框架
- Element Plus - 基于Vue 3的组件库
- Pinia - 新一代状态管理工具
- Vite - 现代前端构建工具

## 快速开始 🚀

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/ProsperousEnding/eatit.git
cd eatit
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm run dev
```

4. 构建生产版本
```bash
pnpm run build
```

## 项目结构 📁

```
eatit/
├── src/
│   ├── assets/      # 静态资源
│   ├── components/  # 公共组件
│   ├── views/       # 页面组件
│   ├── stores/      # Pinia状态管理
│   ├── router/      # 路由配置
│   ├── utils/       # 工具函数
│   └── App.vue      # 根组件
├── public/          # 公共资源
└── index.html       # HTML模板
```

## 主要功能页面 📱

### 首页
- 随机推荐菜品
- 点击进入详情页查看完整信息

### 详情页
- 展示菜品详细信息
- 包含食材清单、制作步骤
- 显示营养成分信息
- 提供菜品搭配建议

### 搜索页
- 支持食材关键词搜索
- 展示相关菜品推荐

## 贡献指南 🤝

欢迎提交问题和改进建议！提交代码前请确保：

1. 代码符合项目规范
2. 添加必要的注释
3. 更新相关文档
4. 通过所有测试

## 开源协议 📄

本项目采用 MIT 协议开源，详见 [LICENSE](LICENSE) 文件。 