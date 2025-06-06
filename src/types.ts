import { IPluginConfig } from 'piclist'

export interface IPluginUserConfig {
    backupDir: string
    operationType: 'copy' | 'cut'
}

export interface IConfig {
    [key: string]: IPluginUserConfig
}

export const CONFIG_PREFIX = '@rerokutosei/picgo-plugin-localbackup'

export const EVENTS = {
    PENDING_DELETION: 'localbackup:pending-deletion'
} as const

export const pluginConfig = (): IPluginConfig[] => {
    return [
        {
            name: `${CONFIG_PREFIX}.backupDir`,
            type: 'input',
            required: true,
            default: './backup',
            message: 'Backup directory path'
        },
        {
            name: `${CONFIG_PREFIX}.operationType`,
            type: 'list',
            required: true,
            choices: [
                { name: 'Copy', value: 'copy' },
                { name: 'Cut (Move to system recycle bin)', value: 'cut' }
            ],
            default: 'copy',
            message: 'Operation type'
        }
    ]
}
