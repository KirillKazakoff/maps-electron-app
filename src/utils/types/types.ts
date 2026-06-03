// configTypes
import config from 'C:\\Users\\admin\\Dropbox\\Семейная папка\\Конфигурация\\config.json';

export type ConfigT = typeof config;
export type VesselsT = ConfigT['vessels'];
export type SettingsT = ConfigT['settings']['main'];
