import * as fs from 'fs'
import * as path from 'path'
import { IHelper, IPicGo, IPluginConfig } from 'picgo'

// 插件配置定义
const pluginConfig = (ctx: IPicGo): IPluginConfig[] => {
    return [
        {
            name: '@rerokutosei/picgo-plugin-localbackup.backupDir',
            type: 'input',
            required: true,
            default: './backup',
            message: 'Backup directory path',
            validate: (val: string): boolean => {
                try {
                    if (!fs.existsSync(val)) {
                        fs.mkdirSync(val, { recursive: true })
                    }
                    return true
                } catch (error) {
                    return false
                }
            }
        },
        {
            name: '@rerokutosei/picgo-plugin-localbackup.operationType',
            type: 'list',
            required: true,
            choices: [
                { name: 'Copy', value: 'copy' },
                { name: 'Cut', value: 'cut' }
            ],
            default: 'copy',
            message: 'Operation type (Copy or Cut)'
        }
    ]
}

// 写入日志的函数
const writeLog = async (logPath: string, message: string): Promise<void> => {
    const timestamp = new Date().toISOString()
    const logMessage = `${timestamp} ${message}\n`
    await fs.promises.appendFile(logPath, logMessage)
}

// 处理图片备份的函数
const handleBackup = async (ctx: IPicGo, outputItem: any): Promise<void> => {
    try {
        // 获取配置参数
        const backupDir = (ctx.getConfig('@rerokutosei/picgo-plugin-localbackup.backupDir') as string) || './backup'
        const operationType = (ctx.getConfig('@rerokutosei/picgo-plugin-localbackup.operationType') as string) || 'copy'
        
        // 确保备份目录存在
        if (!fs.existsSync(backupDir)) {
            await fs.promises.mkdir(backupDir, { recursive: true })
        }
        
        // 获取源文件路径
        let sourcePath = ''
        if (outputItem.buffer?.path) {
            sourcePath = outputItem.buffer.path
        } else if (outputItem.fullPath) {
            sourcePath = outputItem.fullPath
        } else if (typeof outputItem === 'string') {
            sourcePath = outputItem
        } else if (ctx.input?.[0]) {
            sourcePath = ctx.input[0]
        }

        if (!sourcePath || !fs.existsSync(sourcePath)) {
            throw new Error(`Source file not found: ${sourcePath}`)
        }

        ctx.log.info(`Source file: ${sourcePath}`)
        
        // 获取目标路径
        const targetFilename = outputItem.fileName || path.basename(sourcePath)
        const targetPath = path.join(backupDir, targetFilename)
        
        // 创建日志目录
        const logDir = path.join(backupDir, 'logs')
        await fs.promises.mkdir(logDir, { recursive: true })
        const logPath = path.join(logDir, `backup-${new Date().toISOString().split('T')[0]}.log`)
        
        // 执行备份操作
        if (operationType === 'copy') {
            await fs.promises.copyFile(sourcePath, targetPath)
            await writeLog(logPath, `Copied: ${sourcePath} -> ${targetPath}`)
            ctx.log.info('Backup operation completed: ' + targetPath)
        } else {
            await fs.promises.rename(sourcePath, targetPath)
            await writeLog(logPath, `Moved: ${sourcePath} -> ${targetPath}`)
            ctx.log.info('Move operation completed: ' + targetPath)
        }
        
        // 更新输出项的路径
        if (outputItem.buffer) {
            outputItem.buffer.path = targetPath
        }
        outputItem.fullPath = targetPath
    } catch (error) {
        ctx.log.error(`Backup operation failed: ${error}`)
        throw error
    }
}

// 插件主函数
const handle = async (ctx: IPicGo): Promise<void> => {
    for (const outputItem of ctx.output) {
        await handleBackup(ctx, outputItem)
    }
}

export = (ctx: IPicGo) => {
    const register = (): void => {
        ctx.helper.beforeUploadPlugins.register('@rerokutosei/picgo-plugin-localbackup', {
            handle
        })
    }
    return {
        register,
        config: pluginConfig
    }
}