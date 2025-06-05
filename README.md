# PicList Local Backup Plugin

本地备份插件 for [PicList-Core](https://github.com/Kuingsmile/PicList-Core)，配合 PicList-Core 的压缩转格式和高级重命名功能，自动备份处理后的图片文件。

- [PicList Local Backup Plugin](#piclist-local-backup-plugin)
  - [功能特点](#功能特点)
  - [工作流程](#工作流程)
  - [安装](#安装)
    - [通过 npm 安装](#通过-npm-安装)
  - [配置插件](#配置插件)
  - [配置项](#配置项)
    - [备份目录 (backupDir)](#备份目录-backupdir)
    - [操作模式 (operationType)](#操作模式-operationtype)
  - [使用建议](#使用建议)
    - [备份目录设置](#备份目录设置)
    - [使用模式选择](#使用模式选择)
  - [开发](#开发)
  - [License](#license)

## 功能特点

- 自动备份：
  - 自动备份 PicList-Core 压缩转格式后的图片文件
  - 支持与 PicList-Core 高级重命名功能配合
  - 备份文件与图床完全对应，方便后期管理和对照
- 智能路径处理：
  - 自动适配多种图片格式（jpg, png, webp 等）
  - 智能识别文件名，不受特殊字符影响
  - 支持批量处理多个文件
- 支持两种工作模式：
  - Copy 模式：备份处理后的图片，保留原始文件
  - Cut 模式：备份处理后的图片，将原始文件移动到系统回收站
- 安全可靠：
  - 完整的生命周期管理
  - 原子化文件操作
  - 错误处理机制确保主程序正常运行

## 工作流程

插件在 PicList-Core 的图片处理流程中工作：

1. 图片上传前（beforeUpload）:
   - 获取并验证原始文件路径
   - 在临时目录中定位经过压缩转格式的文件
   - 将处理后的文件备份到指定目录（使用临时文件名）
   
2. 图片上传后（afterUpload）:
   - 获取上传成功后的文件名
   - 将备份文件重命名为与图床一致的名称
   - 在 Cut 模式下，将原始文件移动到系统回收站
   - 清理临时文件和状态

## 安装

### 通过 npm 安装

```bash
# 全局安装 piclist (使用npm或yarn)
npm install piclist -g 
# 或
yarn global add piclist

# 安装本插件
picgo install @rerokutosei/picgo-plugin-localbackup # 在线安装
# 或
picgo install path/to/picgo-plugin-localbackup # 本地安装方法①，支持相对/绝对路径
# 或
picgo install path/to/picgo-plugin-localbackup.tgz # 本地安装方法②，使用tgz包
```

## 配置插件

1. 配置插件设置：
```bash
picgo config plugin @rerokutosei/picgo-plugin-localbackup
```

2. 启用插件：
```bash
picgo use plugins @rerokutosei/picgo-plugin-localbackup
```

## 配置项

### 备份目录 (backupDir)
- 默认值：`./backup`
- 说明：存储 PicList 处理后的图片文件的目录
- 特点：
  - 自动创建目录
  - 支持相对/绝对路径
  - 强烈建议使用绝对路径
- 示例：`C:\Users\YourName\Pictures\Backup`

### 操作模式 (operationType)
- 选项：`copy` 或 `cut`
- 说明：
  - `copy`：备份处理后的图片，保留原始文件
  - `cut`：备份处理后的图片，原始文件移至回收站
- 默认值：`copy`

## 使用建议

### 备份目录设置
- 使用绝对路径，避免路径解析问题
- 确保备份目录有足够空间
- 建议选择易于管理的本地目录
- 避免选择系统目录或网络路径

### 使用模式选择
1. Copy 模式：
   - 保留原始文件，适合需要原图的场景
   - 可以随时切换到 Cut 模式
   - 适合初次使用或测试阶段

2. Cut 模式：
   - 自动将原始文件移动到系统回收站
   - 有效管理图片文件，避免重复
   - 需要恢复时可从系统回收站获取
   - 建议先使用 Copy 模式测试后再启用


## 开发

```bash
# 安装依赖
npm install

# 编译
npm run build
```

## License

MIT © ReRokutosei