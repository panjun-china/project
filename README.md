# 科技管理工作台

基于 **Vue 3 + TypeScript + Vite + Element Plus** 构建的科技管理工作台（纯前端 + Mock 数据），用于科研机构 / 企业科技处对科技项目、科研成果、科技人才与科研经费的统一管理。

## ✨ 功能模块

| 模块 | 说明 |
| --- | --- |
| **工作台** | 核心指标统计、经费收支趋势、项目状态分布、部门项目分布、待办事项、通知公告 |
| **科技项目** | 项目列表、多条件筛选、新建 / 编辑 / 删除、进度可视化、分页 |
| **科研成果** | 论文 / 专利 / 软著 / 标准 / 奖励的分类管理与筛选 |
| **科技人才** | 人才卡片墙、职称筛选、承担项目与成果统计 |
| **经费管理** | 拨款 / 支出明细、经费汇总、审批（通过 / 驳回）流程 |

## 🛠 技术栈

- **Vue 3**（`<script setup>` + Composition API）
- **TypeScript**
- **Vite** 构建
- **Element Plus** UI 组件库（中文本地化）
- **Vue Router 4** 路由
- **Pinia** 状态管理
- **ECharts**（vue-echarts）数据可视化

## 📁 目录结构

```
src/
├── components/      # 通用组件（StatCard、BaseChart）
├── layouts/         # 主布局（侧边栏 + 顶栏 + 内容区）
├── mock/            # Mock 数据与模拟异步 API
│   ├── data.ts      # 种子数据
│   └── api.ts       # 模拟接口（分页 / 筛选 / 增删改）
├── router/          # 路由配置
├── stores/          # Pinia 状态
├── styles/          # 全局样式
├── types/           # TypeScript 类型定义
└── views/           # 业务页面
    ├── Dashboard.vue
    ├── project/
    ├── achievement/
    ├── talent/
    └── fund/
```

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 类型检查 + 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 🔌 对接真实后端

当前所有数据来自 `src/mock/`，对接后端时只需将 `src/mock/api.ts` 中的函数替换为真实 HTTP 请求（如 axios / fetch），保持函数签名与返回类型不变，页面层无需改动。
