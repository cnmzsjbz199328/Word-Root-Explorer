# Word Root Explorer

Word Root Explorer 是一个可视化英语词根词缀学习工具，支持词根分析、相关词展示、词义与例句查询。

## 功能特性
- 输入英文单词，自动分析其主要词根及含义
- 展示常见前缀/后缀组合形成的相关单词
- 每个相关单词自动查询英文释义和例句
- 支持词根词缀切换动画，交互友好
- 前端 React + TypeScript + Tailwind CSS，后端 Cloudflare Worker 代理 AI

## 快速开始
1. 克隆仓库并安装依赖：
   ```sh
   git clone https://github.com/yourname/Word-Root-Explorer.git
   cd Word-Root-Explorer
   npm install
   ```
2. 本地开发：
   ```sh
   npm run dev
   ```
3. 构建生产环境：
   ```sh
   npm run build
   ```
4. 部署：
   - 推送到 main 分支，GitHub Actions 自动构建并部署到 gh-pages 分支
   - 访问 GitHub Pages 站点即可

## 目录结构
- `src/` 前端源码
- `src/services/wordRootService.ts` 词根分析与词典查询主逻辑
- `.github/workflows/deploy.yml` 自动化部署脚本
- `Learning.md` 部署与调试经验总结

## 依赖
- React 18
- TypeScript
- Tailwind CSS
- Vite
- lucide-react（图标）

## 环境变量
- 通过 workflow 注入 `SITE_URL`、`SITE_NAME` 到前端
- 后端代理需配置 xAI/OpenAI 等 API Key

## 常见问题
详见 [Learning.md](./Learning.md)

---

> 本项目适合英语学习、词根词缀教学、可视化词汇扩展等场景。