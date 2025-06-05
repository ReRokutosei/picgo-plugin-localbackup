import * as fs from 'fs'
import * as path from 'path'
import trash from 'trash'

export class FileOperations {
    private tempBackupFiles: Map<string, string> = new Map() // 存储临时备份文件路径映射

    constructor(private backupDir: string) {
        this.ensureDirectories()
    }

    private ensureDirectories(): void {
        fs.mkdirSync(this.backupDir, { recursive: true })
    }    async backupTransformedFile(ctx: any, originalPath: string): Promise<void> {
        const tempDir = path.join(ctx.baseDir, 'piclistTemp')
        const originalFileName = path.basename(originalPath, path.extname(originalPath))

        // 读取 piclistTemp 目录下的所有文件
        const tempFiles = await fs.promises.readdir(tempDir)

        // 查找匹配的文件（忽略扩展名）
        const matchingFile = tempFiles.find(file => {
            const tempFileName = path.basename(file, path.extname(file))
            return tempFileName === originalFileName
        })

        if (!matchingFile) {
            throw new Error(`Transformed file not found for: ${originalPath}`)
        }

        const transformedFilePath = path.join(tempDir, matchingFile)
        const tempBackupPath = path.join(this.backupDir, matchingFile)
        await fs.promises.copyFile(transformedFilePath, tempBackupPath)
        
        // 记录临时备份文件路径，供后续重命名使用
        this.tempBackupFiles.set(originalPath, tempBackupPath)
    }

    async renameBackupWithUUID(originalPath: string, uploadUrl: string): Promise<void> {
        const tempBackupPath = this.tempBackupFiles.get(originalPath)
        if (!tempBackupPath) {
            throw new Error(`No backup file found for: ${originalPath}`)
        }

        // 从上传URL中提取uuid文件名
        const urlParts = uploadUrl.split('/')
        const uuidFileName = urlParts[urlParts.length - 1].split('?')[0] // 移除查询参数

        // 重命名备份文件
        const finalBackupPath = path.join(this.backupDir, uuidFileName)
        try {
            await fs.promises.rename(tempBackupPath, finalBackupPath)
            this.tempBackupFiles.delete(originalPath)
        } catch (error) {
            throw new Error(`Failed to rename backup file: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async moveToTrash(filePath: string): Promise<void> {
        try {
            await trash(filePath)
        } catch (error) {
            throw new Error(`Failed to move file to trash: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async pathExists(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath, fs.constants.R_OK)
            return true
        } catch {
            return false
        }
    }

    getOriginalFilePaths(ctx: any): string[] {
        // 优先使用 rawInput
        if (Array.isArray(ctx.rawInput)) {
            const paths = ctx.rawInput
                .filter((item: any) => typeof item === 'string')
                .map((item: string) => item)
            if (paths.length > 0) {
                return paths
            }
        }

        // 回退到 input
        if (Array.isArray(ctx.input)) {
            return ctx.input
                .filter((item: any) => typeof item === 'string')
                .map((item: string) => item)
        }

        return []
    }

    clearTempBackups(): void {
        this.tempBackupFiles.clear()
    }
}
