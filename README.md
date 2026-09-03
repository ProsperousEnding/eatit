# EatIt

> 不知道今天吃什么？从家常菜中挑一道，备好食材，照着步骤直接做。

[![Build and Deploy](https://github.com/ProsperousEnding/eatit/actions/workflows/deploy.yml/badge.svg)](https://github.com/ProsperousEnding/eatit/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-2f855a.svg)](LICENSE)

[在线体验](https://cook.initzo.com/) · [提交问题](https://github.com/ProsperousEnding/eatit/issues) · [菜谱来源](IMAGE_CREDITS.md)

## 项目简介

EatIt 是一个面向日常做饭场景的响应式 Web 应用。项目收录了 120 道经过筛选的中式家常菜谱，提供分类均衡的菜品推荐、关键词搜索、分类筛选、食材用量、分段烹饪步骤和关联菜品推荐。

菜谱数据固定到 [Anduin2017/HowToCook@c694a5c](https://github.com/Anduin2017/HowToCook/tree/c694a5c457d45e6e012ae6cd9a7724aab86e320b)，便于核对内容和追溯图片来源。

## 核心功能

- **首页推荐**：先均衡选择菜品分类，再兼顾口味和烹饪方式的多样性，并避开最近展示过的菜品。
- **菜谱搜索**：支持按菜名、食材、烹饪方式、口味和难度搜索，也可以组合分类条件筛选。
- **家常菜谱**：先展示带数量和克重的食材准备，再给出可以直接执行的烹饪步骤。
- **搭配推荐**：根据当前菜品在一餐中的角色，组合荤菜、水产、素菜、主食或汤粥，并优先选择不同口味和做法。
- **来源追溯**：详情页保留固定版本的原始菜谱出处，以及替代图片的作者和许可证信息。
- **视频入口**：每道菜提供哔哩哔哩和抖音两个教学视频平台入口。
- **响应式体验**：适配手机、平板和桌面端，并按设备尺寸加载本地 WebP 图片。

## 推荐逻辑

推荐结果保留一定随机性，但不是从全部菜品中无条件随机抽取：

| 场景 | 主要规则 |
| --- | --- |
| 首页主推荐 | 先随机选择分类，再从分类内选菜，降低数据量较大分类的曝光偏差 |
| 首页推荐列表 | 轮流从不同分类取菜，并优先补充尚未出现的口味和烹饪方式 |
| 关联菜品 | 先确定两个互补的餐桌角色，再比较分类、口味、做法和已选菜品 |
| 连续刷新 | 在当前会话中记录近期结果，避免刚展示过的菜品立即回流 |

关联菜品的默认组合如下：

| 当前菜品 | 推荐组合 |
| --- | --- |
| 荤菜、水产 | 素菜 + 汤粥或主食 |
| 素菜 | 荤菜或水产 + 汤粥或主食 |
| 主食 | 荤菜或水产 + 素菜或汤粥 |
| 汤粥 | 荤菜或水产 + 素菜或主食 |

## 技术栈

| 分类 | 使用技术 |
| --- | --- |
| 前端 | Vue 3、Vue Router、Pinia、Element Plus |
| 构建 | Vite、pnpm |
| 质量检查 | ESLint、Vitest、Playwright |
| 图片处理 | Sharp |
| 部署 | GitHub Actions、GitHub Pages |

## 快速开始

### 环境要求

- Node.js `>= 20.19.0`
- pnpm `10.32.1`

### 本地运行

```bash
git clone https://github.com/ProsperousEnding/eatit.git
cd eatit
pnpm install
pnpm run dev
```

开发服务器默认运行在 <http://localhost:8889>。

### 构建与预览

```bash
pnpm run build
pnpm run preview
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm run dev` | 启动本地开发服务器 |
| `pnpm run build` | 构建生产版本 |
| `pnpm run build:pages` | 使用自定义域名根路径构建 GitHub Pages 版本 |
| `pnpm run preview` | 预览本地生产构建 |
| `pnpm run lint` | 检查 JavaScript 和 Vue 文件 |
| `pnpm run test` | 运行 Vitest 单元与组件测试 |
| `pnpm run test:e2e` | 在 Chromium、Firefox 和 WebKit 中运行端到端测试 |
| `pnpm run recipes:client` | 从主菜谱数据重新生成客户端索引和详情文件 |
| `pnpm run recipes:check` | 检查客户端菜谱数据是否与主数据一致 |
| `pnpm run images:optimize` | 生成响应式 WebP 图片及图片清单 |
| `pnpm run images:check` | 检查图片、变体和清单是否一致 |
| `pnpm run check` | 运行代码、数据、图片、测试和构建检查 |

第一次运行浏览器测试前，需要安装对应浏览器：

```bash
pnpm exec playwright install chromium firefox webkit
pnpm run test:e2e
```

## 项目结构

```text
eatit/
├── .github/workflows/       # 持续集成与 GitHub Pages 部署
├── public/
│   └── images/dishes/       # 菜品源图和响应式图片
├── scripts/                 # 菜谱导入、客户端数据和图片处理脚本
├── src/
│   ├── components/          # 通用组件
│   ├── composables/         # 页面元数据等组合逻辑
│   ├── config/              # 分类等共享配置
│   ├── data/
│   │   ├── dishes.json      # 菜谱主数据
│   │   └── client/          # 生成的列表、搜索和按菜品拆分的数据
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia 状态和推荐逻辑
│   ├── styles/              # 全局及按页面拆分的样式
│   ├── utils/               # 图片、菜谱和步骤工具
│   └── views/               # 首页、分类、搜索和详情页
├── tests/e2e/               # Playwright 端到端测试
├── IMAGE_CREDITS.md         # 数据与图片来源说明
├── IMAGE_INVENTORY.md       # 逐菜图片清单（自动生成）
└── RECIPE_IMPORT_REPORT.md  # HowToCook 导入审计报告（自动生成）
```

## 菜谱与图片维护

`src/data/dishes.json` 是项目的菜谱主数据。`src/data/client/`、`src/data/image-variants.json`、`IMAGE_INVENTORY.md` 和 `RECIPE_IMPORT_REPORT.md` 由脚本生成，不应直接手工修改。

从当前固定版本重新导入 HowToCook 数据：

```bash
git clone https://github.com/Anduin2017/HowToCook.git ../HowToCook
git -C ../HowToCook checkout c694a5c457d45e6e012ae6cd9a7724aab86e320b
pnpm run recipes:import:howtocook -- --source ../HowToCook
pnpm run images:optimize
pnpm run check
```

导入器只处理项目定义的家常菜范围，并要求菜谱具有可解析的用量、准备内容、烹饪步骤和匹配的成品图。图片会进行方向纠正和必要的聚焦裁切，不使用 AI 生成或 AI 放大。完整规则及逐条结果见 [导入报告](RECIPE_IMPORT_REPORT.md)。

## 数据与图片来源

- 菜谱用量和步骤主要来自固定版本的 [HowToCook](https://github.com/Anduin2017/HowToCook)，对应内容采用其仓库声明的 Unlicense。
- 绝大多数菜品图片来自同一固定版本；`简易红烧肉`和`葱烧海参`使用了已审核并随项目保存的 Creative Commons 授权图片。
- 每道菜的图片路径、处理方式、来源和许可证记录在 [IMAGE_INVENTORY.md](IMAGE_INVENTORY.md) 中。
- 更完整的来源和授权说明见 [IMAGE_CREDITS.md](IMAGE_CREDITS.md)。

## 部署

推送到 `main` 分支后，[GitHub Actions](.github/workflows/deploy.yml) 会执行完整质量检查、构建 GitHub Pages 版本并部署到 <https://cook.initzo.com/>。Pull Request 只执行检查和构建，不会发布站点。

站点基础路径由 `VITE_BASE_URL` 控制：

```env
VITE_BASE_URL=/
```

本地开发和自定义域名都使用 `/` 根路径。Cloudflare DNS 需要添加一条 `CNAME` 记录：名称为 `cook`，目标为 `prosperousending.github.io`，首次验证时使用 `DNS only`。

## 参与贡献

欢迎通过 [Issue](https://github.com/ProsperousEnding/eatit/issues) 报告菜谱问题、图片与来源问题或功能建议。提交 Pull Request 前请：

1. 将改动保持在明确范围内，并同步更新相关测试或文档。
2. 修改菜谱或图片后运行对应的数据生成脚本。
3. 确保 `pnpm run check` 通过；涉及页面交互时再运行 `pnpm run test:e2e`。

## 许可证

项目代码采用 [MIT License](LICENSE)。菜谱内容和图片保留各自来源所声明的许可证，使用或再分发时请同时查阅 [IMAGE_CREDITS.md](IMAGE_CREDITS.md) 和 [IMAGE_INVENTORY.md](IMAGE_INVENTORY.md)。
