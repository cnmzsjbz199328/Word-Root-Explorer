# Word Root Explorer 项目部署与调试学习笔记

## 1. 项目结构与分支说明

- `main` 分支：存放源代码、配置、CI/CD 脚本，仅用于开发和维护。
- `gh-pages` 分支：自动生成的静态资源分支，仅供 GitHub Pages 部署使用，不手动修改。

## 2. 自动化部署流程（deploy.yml）

- 每次 `main` 分支有 push 时，GitHub Actions 会：
  1. 检出代码
  2. 安装依赖（npm install）
  3. 构建产物（npm run build）
  4. 注入前端环境变量到 `dist/local.env.js`
  5. 用 peaceiris/actions-gh-pages 自动将 `dist` 目录推送到 `gh-pages` 分支
- GitHub Pages 设置为 `gh-pages` 分支作为 Source，网站内容自动更新。

## 3. 常见问题与解决方案

### 3.1 Pages 部署空白/404
- **原因**：Vite 的 `base` 没有设置为仓库名，导致资源路径错误。
- **解决**：在 `vite.config.ts` 设置 `base: '/Word-Root-Explorer/'`。

### 3.2 两个 workflow 同时部署
- **原因**：GitHub Pages 默认 workflow（pages-build-deployment）和自定义 workflow 并存。
- **解决**：只保留自定义 deploy.yml，Settings > Pages 选择 gh-pages 分支作为 Source，不选 GitHub Actions。

### 3.3 main/gh-pages 分支关系
- main 只做开发和构建，gh-pages 只存静态产物，由 workflow 自动生成。

### 3.4 依赖库管理
- 只需上传源码和配置文件（如 package.json、vite.config.ts），不上传 node_modules 和 dist。
- 依赖由构建时自动下载。
- .gitignore 示例：
  ```
  node_modules/
  dist/
  local.env.js
  *.log
  .vscode/
  .idea/
  *.swp
  *.swo
  .DS_Store
  Thumbs.db
  ```

### 3.5 git push 报错 non-fast-forward
- **原因**：远程 main 分支有新提交，本地未同步。
- **解决**：
  ```sh
  git pull origin main
  # 解决冲突后
  git add .
  git commit -m "fix: resolve merge conflict"
  git push origin main
  ```

### 3.6 fetchWordRootData 总是返回默认数据
- **原因**：mock 实现未根据输入动态生成数据。
- **解决**：让 mock 根据输入动态生成，或接入真实 API。
  ```ts
  const fetchWordRootData = async (word: string): Promise<WordRootData> => {
    const root = word.trim().toLowerCase() || 'demo';
    // ...生成相关数据...
  }
  ```

### 3.7 依赖缺失导致构建失败
- **如 @vitejs/plugin-react 缺失**：
  ```sh
  npm install --save-dev @vitejs/plugin-react
  ```

## 4. 其它建议
- `vite.config.ts`、`package.json`、`index.html`、`src/` 目录等必须上传。
- `node_modules`、`dist`、`local.env.js` 等自动生成文件应加入 `.gitignore`。
- 本地开发用 `npm run dev`，生产构建用 `npm run build`。
- 环境变量通过 workflow 注入 `local.env.js`，不要硬编码在源码中。

---

> 本文档总结了 Word Root Explorer 项目在 GitHub Pages 自动化部署、调试、依赖管理、常见问题排查等方面的经验，供后续开发和维护参考。
