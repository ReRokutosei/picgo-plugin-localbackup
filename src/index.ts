import { IPicGo } from 'piclist'
import * as path from 'path'
import { FileOperations } from './utils'
import { CONFIG_PREFIX, IPluginUserConfig, pluginConfig, IConfig } from './types'

class LocalBackupPlugin {
    private fileOps: FileOperations | null = null
    private originalPaths: string[] | null = null

    constructor(private ctx: IPicGo) {}

    private getConfig(): IPluginUserConfig {
        const config = this.ctx.getConfig(CONFIG_PREFIX) as IConfig
        if (!config || !config[CONFIG_PREFIX]) {
            return {
                backupDir: './backup',
                operationType: 'copy'
            }
        }
        return {
            backupDir: config[CONFIG_PREFIX].backupDir || './backup',
            operationType: config[CONFIG_PREFIX].operationType || 'copy'
        }
    }

    private ensureFileOps(): FileOperations {
        if (!this.fileOps) {
            const config = this.getConfig()
            this.fileOps = new FileOperations(config.backupDir)
        }
        return this.fileOps
    }

    async beforeUpload(ctx: IPicGo): Promise<void> {
        try {
            // 获取原始文件路径
            const fileOps = this.ensureFileOps()
            const originalPaths = fileOps.getOriginalFilePaths(ctx)

            if (originalPaths.length === 0) {
                ctx.log.info('No original files to process')
                return
            }

            ctx.log.info(`Found ${originalPaths.length} original files`)

            // 验证原始文件是否存在
            for (const filePath of originalPaths) {
                if (!await fileOps.pathExists(filePath)) {
                    ctx.log.warn(`Original file not accessible: ${filePath}`)
                    return
                }
                ctx.log.info(`Original file verified: ${filePath}`)

                // 备份转换后的文件（使用原始文件名）
                try {
                    await fileOps.backupTransformedFile(ctx, filePath)
                    ctx.log.info(`Temporarily backed up transformed file for: ${filePath}`)
                } catch (error) {
                    ctx.log.error(`Failed to backup transformed file: ${error instanceof Error ? error.message : String(error)}`)
                }
            }

            // 记录原始文件路径
            this.originalPaths = originalPaths

        } catch (error) {
            ctx.log.error(`Error in beforeUpload: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async afterUpload(ctx: IPicGo): Promise<void> {
        try {
            if (!this.originalPaths || this.originalPaths.length === 0) {
                return
            }

            const config = this.getConfig()
            const fileOps = this.ensureFileOps()            // 获取上传后的URL并重命名备份文件
            if (Array.isArray(ctx.output) && ctx.output.length > 0) {
                // 遍历所有已上传的文件
                for (let i = 0; i < ctx.output.length; i++) {
                    const uploadInfo = ctx.output[i]
                    const originalPath = this.originalPaths?.[i]
                    
                    if (uploadInfo.imgUrl && originalPath) {
                        try {
                            await fileOps.renameBackupWithUUID(originalPath, uploadInfo.imgUrl)
                            ctx.log.info(`Successfully renamed backup file with UUID for ${originalPath}`)
                        } catch (error) {
                            ctx.log.error(`Failed to rename backup file for ${originalPath}: ${error instanceof Error ? error.message : String(error)}`)
                        }
                    }
                }
            }

            // 如果是剪切模式，删除原始文件
            if (config.operationType === 'cut') {
                ctx.log.info('Moving original files to system trash...')
                for (const filePath of this.originalPaths) {
                    try {
                        await fileOps.moveToTrash(filePath)
                        ctx.log.info(`Moved original file to system trash: ${filePath}`)
                    } catch (error) {
                        ctx.log.error(`Failed to move original file ${filePath} to trash: ${error instanceof Error ? error.message : String(error)}`)
                    }
                }
            }
        } catch (error) {
            ctx.log.error(`Error in afterUpload: ${error instanceof Error ? error.message : String(error)}`)
        } finally {
            // 清理状态
            this.originalPaths = null
            if (this.fileOps) {
                this.fileOps.clearTempBackups()
                this.fileOps = null
            }
        }
    }

    register(): void {
        this.ctx.helper.beforeUploadPlugins.register(CONFIG_PREFIX, {
            handle: (ctx) => this.beforeUpload(ctx)
        })
        this.ctx.helper.afterUploadPlugins.register(CONFIG_PREFIX, {
            handle: (ctx) => this.afterUpload(ctx)
        })
    }
}

export = (ctx: IPicGo) => {
    return {
        register: () => {
            const plugin = new LocalBackupPlugin(ctx)
            plugin.register()
        },
        config: pluginConfig
    }
}