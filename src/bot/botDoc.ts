import fs from 'fs';
import { botLog } from './botLog';
import { getDateNow } from '../utils/date';
import { timePromise } from '../utils/time';
import { botSetup } from './botSetup';
import { getConfig } from '../puppeteer/fsModule/readConfig';

const config = getConfig();

type SettingsT = {
    path: string;
    type: 'vessel' | 'quotes' | 'fish' | 'tech' | 'crab' | 'f19Querry';
    sizeCheck?: number;
};

export class BotDoc {
    async doc({ path, type, sizeCheck }: SettingsT) {
        const name = path.split('//').pop()?.split('.').shift();

        if (!name) {
            botLog.bot('error on file path parsing on path: ' + path);
            return;
        }

        try {
            const fileSize = fs.readFileSync(path).byteLength;
            if (sizeCheck && fileSize / 1024 < sizeCheck) {
                throw new Error('empty report');
            }

            // get chat where I need to send report
            let chat = config.chat.reports;
            if (type === 'tech') chat = config.chat.tech;

            await botSetup.api.sendDocument(chat.id, path);
        } catch (e: any) {
            if (e.message === 'empty report') {
                botLog.bot('empty report ' + name.toUpperCase());
                return;
            }

            botLog.bot('error on send document ' + name.toUpperCase() + '- ' + e.message);
        }
    }

    async pdf({ name: docName, type }: { name: string; type: SettingsT['type'] }) {
        const oldPath = `C:\\Users\\admin\\Dropbox\\Семейная папка\\БД\\Модель данных\\БД\\${docName}.pdf`;

        const reportName = `${docName} от ${getDateNow()}.pdf`;
        const newPath = `C:\\Users\\admin\\Dropbox\\Семейная папка\\БД\\Модель данных\\Отчеты\\Бот\\${reportName}`;

        // rename path report if pdf
        try {
            fs.renameSync(oldPath, newPath);
        } catch (e) {
            botLog.bot(`Error on rename this doc path: ${newPath}`);
            return;
        }

        await timePromise(5000);
        await this.doc({ sizeCheck: 85, path: newPath, type });
    }

    async xlsx() {
        const path =
            'C:\\Users\\admin\\iCloudDrive\\Конспираторы\\ОВЭД\\БД Производство\\0_Аналитика ССД\\ДВ БД\\2025 Вылов и икра.xlsx';
        await this.doc({ path, type: 'f19Querry', sizeCheck: 150 });
    }
}

export const botDoc = new BotDoc();
