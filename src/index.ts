import * as fs from 'fs'
import * as path from 'path'
import { IHelper, IPicGo, IPluginConfig } from 'picgo'

// 日期格式化函数
function formatDate(date: Date, format: string): string {
    const pad = (n: number, s: number = 2): string => ('0'.repeat(s) + n).slice(-s)
    const replacements: Record<string, string> = {
        yyyy: date.getFullYear().toString(),
        MM: pad(date.getMonth() + 1),
        dd: pad(date.getDate()),
        HH: pad(date.getHours()),
        mm: pad(date.getMinutes()),
        ss: pad(date.getSeconds())
    }
    
    return format.replace(/(yyyy|MM|dd|HH|mm|ss)/g, (_, grp) => replacements[grp])
}

// UUID生成函数
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

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
        },
        {
            name: '@rerokutosei/picgo-plugin-localbackup.renameTemplate',
            type: 'input',
            required: true,
            default: '{filename}{extname}',
            message: 'Rename template. Available placeholders: {filename}, {extname}, {timestamp}, {uuid}, {date:format}'
        }
    ]
}

const handle = async (ctx: IPicGo): Promise<void> => {
    // 获取输入数组
    if (!ctx.input || !ctx.input.length) {
        ctx.log.warn('No input files found')
        return
    }

    // 文件路径
    const file: string = ctx.input[0]
    ctx.log.info(`Processing file: ${file}`)

    // 获取配置参数
    const backupDir = (ctx.getConfig('@rerokutosei/picgo-plugin-localbackup.backupDir') as string) || './backup'
    const operationType = (ctx.getConfig('@rerokutosei/picgo-plugin-localbackup.operationType') as string) || 'copy'
    const renameTemplate = (ctx.getConfig('@rerokutosei/picgo-plugin-localbackup.renameTemplate') as string) || '{filename}{extname}'
    
    ctx.log.info(`backupDir: ${backupDir}`)
    ctx.log.info(`operationType: ${operationType}`)
    ctx.log.info(`renameTemplate: ${renameTemplate}`)

    try {
        // 确保备份目录存在
        if (!fs.existsSync(backupDir)) {
            await fs.promises.mkdir(backupDir, { recursive: true })
        }
        
        // 创建日志目录并定义日志文件路径
        const logDir = path.join(backupDir, 'logs')
        await fs.promises.mkdir(logDir, { recursive: true })
        const logFilePath = path.join(logDir, `backup-${new Date().toISOString().split('T')[0]}.log`)

        // 日志写入函数
        const writeLog = async (message: string): Promise<void> => {
            const timestamp = new Date().toISOString()
            const logMessage = `[${timestamp}] ${message}\n`
            try {
                await fs.promises.appendFile(logFilePath, logMessage, { encoding: 'utf8' })
            } catch (error: unknown) {
                if (error instanceof Error) {
                    ctx.log.warn(`Failed to write log: ${error.message}`)
                } else {
                    ctx.log.warn('Failed to write log: Unknown error')
                }
            }
        }

        // 生成备份文件名
        const { name: filename, ext: extname } = path.parse(file)
        const timestamp = Date.now().toString()
        const uuid = generateUUID()
        const now = new Date()

        // 应用模板
        let backupFileName = renameTemplate
            .replace('{filename}', filename)
            .replace('{extname}', extname)
            .replace('{timestamp}', timestamp)
            .replace('{uuid}', uuid)
            .replace(/{date:(.*?)}/g, (_, format) => formatDate(now, format))

        // 确保文件名不包含非法字符
        backupFileName = backupFileName.replace(/[<>:"/\\|?*]/g, '_')
        const backupPath = path.join(backupDir, backupFileName)

        // 执行备份操作
        if (operationType === 'copy') {
            await fs.promises.copyFile(file, backupPath)
            await writeLog(`File copied to: ${backupPath}`)
        } else if (operationType === 'cut') {
            await fs.promises.rename(file, backupPath)
            await writeLog(`File moved to: ${backupPath}`)
        }

        ctx.log.success(`Backup operation completed: ${backupPath}`)
    } catch (error: unknown) {
        if (error instanceof Error) {
            ctx.log.error(`Backup failed: ${error.message}`)
        } else {
            ctx.log.error('Backup failed with unknown error')
        }
    }
}

const plugin = (ctx: IPicGo) => {
    const register = () => {
        ctx.helper.beforeTransformPlugins.register('@rerokutosei/picgo-plugin-localbackup', {
            handle
        })
    }
    return {
        register,
        config: pluginConfig
    }
}

export = plugin