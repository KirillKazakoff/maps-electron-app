import { ipcMain } from 'electron';
import { bot } from '../bot/bot';
import { FormDateT } from '../UI/stores/settingsStore';
import { calcARMDateFromNow, calcARMDateNow } from '../utils/date';
import { timePromise } from '../utils/time';
import { downloadF10Report } from '../puppeteer/f10/downloadF10Report';
import { downloadF16Report } from '../puppeteer/f16/downloadF16Report';
import { parseF16List } from '../puppeteer/f16/parseF16/parseF16List';
import { sendF16InfoBot } from '../puppeteer/f16/sendF16InfoBot';
import { downloadF19Report } from '../puppeteer/f19/downloadF19Report';
import { operateF19 } from '../puppeteer/f19/operateF19';
import { readConfig, vessels } from '../puppeteer/fsModule/readConfig';
import nodeCron from 'node-cron';
import type { PowerIpcT } from './setPowerAUIpc';
import { api } from '../api/api';
import { archiveToDB } from '../puppeteer/f16/archiveToDB';

export const setOsmIpc = (powerIpc: PowerIpcT) => {
    // F19
    ipcMain.on('sendF19', () => {
        readConfig();
        downloadF19Report(calcARMDateFromNow(), true);
    });
    ipcMain.on('sendXMLF19', () => {
        readConfig();
        operateF19(true);
    });
    ipcMain.on('sendF19Date', (e, date: FormDateT) => {
        readConfig();
        downloadF19Report(date, false);
    });

    // F16
    const sendF16CompanyPlanner = async () => {
        readConfig();
        bot.log.bot('company vessels ssd report load started');

        const date = calcARMDateFromNow();
        const f16Data = await downloadF16Report(date, [
            ...vessels.company,
            ...vessels.transport,
        ]);
        if (!f16Data) return;

        sendF16InfoBot(f16Data);
    };
    ipcMain.on('sendF16Company', () => {
        sendF16CompanyPlanner();
    });
    ipcMain.on('sendF16', (e, date: FormDateT) => {
        readConfig();
        downloadF16Report(date, [...vessels.main, ...vessels.special]);
    });
    ipcMain.on('sendF16XML', () => {
        readConfig();
        const f16Data = parseF16List('debugSSD');
        sendF16InfoBot(f16Data);
    });
    ipcMain.on('sendF16Backend', async () => {
        readConfig();
        const f16Data = archiveToDB();
        // const f16Data = parseF16List('debugSSD');
        api.send.ssdInfo(f16Data);
    });
    ipcMain.on('sendBackendDebug', async () => {
        readConfig();
        api.send.debugBackedn('vessel');
    });
    // F10
    ipcMain.on('sendF10', () => {
        readConfig();
        downloadF10Report(calcARMDateNow(), false);
    });
    ipcMain.on('sendF10Date', (e, date: FormDateT) => {
        readConfig();
        downloadF10Report(date, true);
    });

    // osmLoad planner
    const cbPlanner = async () => {
        try {
            readConfig();
            bot.log.bot('Osm reports load started');

            const date = calcARMDateFromNow();

            await downloadF16Report(date, [...vessels.main, ...vessels.special]);
            await downloadF10Report(calcARMDateNow(), false);
            await downloadF19Report(date, true);

            bot.log.bot('end loading osm');
            await timePromise(120000);
            bot.log.bot('start power automate script');

            // update md
            await powerIpc.updateModelAll();
        } catch (e: any) {
            console.error(e);
            bot.log.bot('UNEXPECTED ERROR in OSM api: ' + e.message);
        }
    };
    ipcMain.on('sendManual', () => cbPlanner());

    const returnObj = {
        taskOsm: <nodeCron.ScheduledTask>{},
        taskCompany: <nodeCron.ScheduledTask>{},
        cbPlanner,
        sendF16CompanyPlanner,
    };

    ipcMain.on('sendPlanner', (e, schedule) => {
        bot.log.bot('bot osm load planned on ' + schedule);

        if (returnObj.taskOsm) returnObj.taskOsm.stop();

        returnObj.taskOsm = nodeCron.schedule(schedule, cbPlanner);
    });

    return returnObj;
};
