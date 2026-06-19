// configTypes
import config from 'C:\\Users\\admin\\Dropbox\\Семейная папка\\Конфигурация\\config.json';

export type ConfigT = typeof config;
export type VesselsT = ConfigT['vessels'];
export type SettingsT = ConfigT['settings']['main'];

export type Paths<T> =
    T extends Array<infer U>
        ? `${Paths<U>}`
        : T extends object
          ? {
                [K in keyof T & (string | number)]: K extends string
                    ? `${K}` | `${Paths<T[K]>}`
                    : never;
            }[keyof T & (string | number)]
          : never;
