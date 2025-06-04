# PicList Local Backup Plugin

本地备份插件 for [PicList-Core](https://github.com/Kuingsmile/PicList-Core)

- [PicList Local Backup Plugin](#piclist-local-backup-plugin)
  - [功能特点](#功能特点)
  - [安装](#安装)
    - [通过 npm 安装](#通过-npm-安装)
  - [配置插件](#配置插件)
  - [配置项](#配置项)
  - [日志系统](#日志系统)
    - [日志示例](#日志示例)
  - [开发](#开发)
  - [License](#license)

## 功能特点

- 在上传图片前自动备份到本地目录
- 支持复制或剪切操作
- 详细的日志记录系统
- 不干扰 PicList-Core 原有的上传流程

## 安装

### 通过 npm 安装

```bash
# 全局安装 picgo
npm install picgo -g

# 安装本插件
picgo install @rerokutosei/picgo-plugin-localbackup
```

## 配置插件
```bash
# 配置插件
picgo config plugin @rerokutosei/picgo-plugin-localbackup

# 启用插件
picgo use plugins @rerokutosei/picgo-plugin-localbackup
```

## 配置项

插件提供以下配置项：

1. `backupDir`: 备份目录路径（默认: './backup'）
   - 指定本地备份文件的存储目录
   - 如果目录不存在会自动创建
   - 支持相对路径和绝对路径
   - 建议使用绝对路径以避免路径解析问题

2. `operationType`: 操作类型（'copy' 或 'cut'）
   - copy: 复制原文件到备份目录（保留原文件）
   - cut: 移动原文件到备份目录（删除原文件）

## 日志系统

插件会在备份目录的 `logs` 子目录下生成日期格式的日志文件，记录所有备份操作：

- 日志文件名格式：`backup-YYYY-MM-DD.log`
- 每条日志包含：
  - 时间戳
  - 操作类型（复制/移动）
  - 源文件路径
  - 目标文件路径

### 日志示例

```
2025-06-04T10:15:30.123Z Copied: C:\Users\Example\image.jpg -> D:\backup\c9549605-6017-454c-9743-34d40d158121.jpg
```

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run build
```

## License

MIT © ReRokutosei