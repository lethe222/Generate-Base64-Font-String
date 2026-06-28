# Generate Base64 Font String

一个简洁高效的在线字体转换工具，可以将 TTF、OTF、WOFF、WOFF2 格式的字体文件转换为 Base64 编码字符串，并生成可直接内联到 CSS 的 `@font-face` 代码。

## 功能特点

- **多格式支持**：支持 TTF、OTF、WOFF、WOFF2 四种常见字体格式
- **实时预览**：转换完成后即时显示字体渲染效果
- **一键复制**：快速复制 Base64 字符串或完整的 CSS 代码
- **批量处理**：支持同时上传多个字体文件
- **纯前端处理**：所有转换在浏览器本地完成，字体文件不会上传到服务器
- **用户反馈**：内置反馈系统，方便用户提交使用体验和建议

## 技术栈

- **React 18** - 前端框架
- **Vite 6** - 构建工具
- **Tailwind CSS 4** - 样式框架
- **Lucide React** - 图标库

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本

```bash
pnpm build
```

构建产物位于 `dist/` 目录

## 使用步骤

1. **上传字体文件**：拖拽或点击选择字体文件（支持 TTF、OTF、WOFF、WOFF2）
2. **查看预览**：实时预览字体渲染效果，确认字体正确加载
3. **复制代码**：
   - 复制 Base64 字符串用于其他用途
   - 复制完整的 `@font-face` CSS 代码直接粘贴到样式表
4. **应用到项目**：将 CSS 代码粘贴到项目中即可使用字体

## 项目结构

```
Generate Base64 Font String/
├── src/
│   ├── app/
│   │   ├── App.tsx           # 主应用组件
│   │   └── components/
│   │       └── FeedbackForm.tsx  # 用户反馈组件
│   ├── main.tsx              # 入口文件
│   └── styles/
│       └── index.css         # 全局样式
├── public/
│   └── icon.svg              # 应用图标
├── index.html                # HTML 模板
├── vite.config.ts            # Vite 配置
├── package.json              # 项目配置
└── README.md                 # 项目说明
```

## 特色功能

### 字体预览

转换完成后，应用会自动加载字体并显示多语言预览文本：
- 中文：永字八法，横竖撇捺折钩点
- 英文：The quick brown fox jumps over the lazy dog
- 数字和符号：0123456789 ！@#￥%……&*（） AaBbCcDd

### 用户反馈

右下角浮动按钮提供便捷的反馈入口：
- 紫色渐变按钮：用户反馈
- 蓝色按钮：返回首页

反馈表单支持：
- 反馈内容（必填）
- 联系方式（选填）
- 评分（1-5星）

## 许可证

本项目基于 Figma 设计稿开发，原始设计来源：[Generate Base64 Font String](https://www.figma.com/design/tHWAqEzBa9s2kooKiiVmAL/Generate-Base64-Font-String)

## 相关链接

- [设计工具集合首页](https://lethe222.github.io/Design-tool-collection-website/#)
- [GitHub 仓库](https://github.com/lethe222/Generate-Base64-Font-String)