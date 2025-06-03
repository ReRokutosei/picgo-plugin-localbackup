# PicGo Local Backup Plugin

本地备份插件 for [PicGo-Core](https://github.com/PicGo/PicGo-Core)

## 功能特点

- 上传图片时自动备份到本地目录
- 支持复制或剪切操作
- 支持自定义文件名模板，包含多种占位符
- 详细的日志记录系统

## 安装

### 方式1：通过 npm 安装（推荐）

```bash
# 全局安装 picgo
npm install picgo -g

# 安装本插件
picgo install @rerokutosei/picgo-plugin-localbackup
```

### 方式2：手动安装

1. 克隆本仓库
2. 在仓库目录下执行：
```bash
npm install
npm run build
```
3. 将生成的 `dist` 目录复制到 PicGo 的插件目录中

## 配置

插件提供以下配置项：

1. `backupDir`: 备份目录路径（默认: './backup'）
2. `operationType`: 操作类型（'copy' 或 'cut'）
3. `renameTemplate`: 文件重命名模板

### 重命名模板支持的占位符：

- `{filename}`: 原始文件名（不含扩展名）
- `{extname}`: 文件扩展名（包含点号）
- `{timestamp}`: 时间戳
- `{uuid}`: 唯一标识符
- `{date:format}`: 日期格式化，例如 `{date:yyyy-MM-dd}`

### 示例配置：

```bash
picgo set plugin @rerokutosei/picgo-plugin-localbackup
```

## 日志

插件会在备份目录的 `logs` 子目录下生成日期格式的日志文件，记录所有备份操作。

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run build
```

## License

MIT © ReRokutosei