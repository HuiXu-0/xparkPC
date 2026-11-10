# GitHub Pages 界面展示副本

这个目录只用于把当前产品的**界面**发布到 GitHub Pages 供人预览，不参与产品运行。

- `index.html`：由 `SparkChat/frontend/index.html` 原样复制，仅多加载一行 `demo.js`。生成方式：`python preview/build.py`。
- `demo.js`：在浏览器内存里提供示例数据并拦截应用接口，让 7 个页面在没有后端时也能完整显示。所有回复均为示例文案，**不会调用模型**。
- 产品源码（`backend/`、`SparkChat/web-frontend-lite/`、`SparkChat/frontend/`）不被修改；前端更新后重新运行 `build.py` 即可同步界面。

发布由 `.github/workflows/pages.yml` 完成，站点源为本目录。
