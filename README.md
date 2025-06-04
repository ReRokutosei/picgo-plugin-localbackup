# PicList Local Backup Plugin

本地备份插件 for [PicList-Core](https://github.com/Kuingsmile/PicList-Core)

## 功能特点

- 在上传图片前自动备份到本地目录
- 支持复制或剪切操作
- 使用与 PicList 相同的重命名规则，确保本地备份与云端文件名一致性
- 详细的日志记录系统
- 适配阿里云等对中文文件名进行 URL 编码的图床服务
- 完全不干扰 PicGo 原有的上传流程

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
   - 指定本地备份文件的存储目录
   - 如果目录不存在会自动创建
   - 支持相对路径和绝对路径
   - 建议使用绝对路径以避免路径解析问题

2. `operationType`: 操作类型（'copy' 或 'cut'）
   - copy: 复制原文件到备份目录（保留原文件）
   - cut: 移动原文件到备份目录（删除原文件）

### 重要说明

- 本插件现在使用 PicGo 的重命名系统，不再提供单独的重命名功能
- 建议在 PicGo 配置中设置重命名模板为 `{uuid}`，这样可以：
  1. 避免文件名冲突
  2. 确保本地备份与云端文件保持一致性
  3. 便于日后文件匹配和管理

### 示例配置：

```bash
picgo set plugin @rerokutosei/picgo-plugin-localbackup
```

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

## 最佳实践

1. **备份目录设置**
   - 建议使用绝对路径，例如：`D:\Pictures\Backup`
   - 确保目录具有写入权限
   - 避免使用系统关键目录

2. **PicGo 配置建议**
   - 设置 PicGo 的重命名格式为 `{uuid}`
   - 启用图片压缩可以节省备份空间
   - 推荐开启 webp 转换以获得更好的压缩率

3. **使用场景**
   - 图床迁移：备份可用于快速恢复或迁移
   - 防止数据丢失：本地备份可作为云端数据的保障
   - 批量处理：可以通过本地备份批量处理图片

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run build
```

## License

MIT © ReRokutosei