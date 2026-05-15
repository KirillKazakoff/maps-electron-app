// import { bot } from '../../bot/bot';

// RRR
const username = __dirname.split(/[/\\]/)[2];
const isAdmin = username === 'admin';
const mainDir = isAdmin ? `C:\\Users\\admin\\Dropbox\\Семейная папка\\` : '\\\\Mac\\iCloud\\';
const serverPath = isAdmin ? 'C:\\Users\\admin' : 'C:\\users\\kirillkazakov';

const downloadDir = isAdmin ? `${serverPath}\\Downloads` : `\\\\Mac\\Home\\Downloads`;
const powershellDir = `${serverPath}\\Desktop\\Repo\\maps-electron\\src\\powershell\\`;
const cloudDir = mainDir + '\\ССД расшиф v2';

export const configUrl = mainDir + '\\Конфигурация\\config.json';

// setTimeout(() => bot.log.bot(username), 5000)

export const getDirPathes = () => {
    return {
        powershell: powershellDir,
        downloads: downloadDir,
        downloadsSSD: downloadDir + '\\SSD\\',
        ssd: cloudDir + '\\SSD\\',
        quotes: mainDir + '\\КВОТЫ ССД\\Квоты РФ',
        quotesFormDate: mainDir + '\\КВОТЫ ССД\\Квоты РФ Выгрузка',
        f19: mainDir + '\\ДВ БД\\Выгрузки\\Вылов (форма Ф19)\\',
    };
};
