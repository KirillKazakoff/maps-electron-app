/* eslint-disable prefer-const */
import { ipcMain } from 'electron';
import { bot } from '../bot/bot';
import { timePromise } from '../utils/time';
import nodeCron from 'node-cron';
import { updateRDO } from '../powershell/updateRDO';
import {
    sendUnsignedReestr,
    sendUnsignedReestrExport,
} from '../powershell/sendUnsignedReestr';
import { runVBS } from '../powershell/runVBS';

export const setPowerAUIpc = () => {
    const sendReportsTG = async () => {
        await bot.doc.pdf({ type: 'vessel', name: 'Судовой отчет' });
        await bot.doc.pdf({ type: 'tech', name: 'Технический отчет' });
    };
    // updateDB
    const updateModelAll = async () => {
        try {
            await runVBS('update_db.vbs');
            await timePromise(5000);

            await runVBS('update_model.vbs');
            await timePromise(5000);

            await sendReportsTG();
        } catch (e: any) {
            bot.log.bot('UNEXPECTED ERROR on VBScript: ' + e.message);
        }
    };

    ipcMain.on('sendUpdateMd', () => runVBS('update_db.vbs'));
    ipcMain.on('sendUpdateModel', () => runVBS('update_model.vbs'));
    ipcMain.on('sendReportDebug', () => sendReportsTG());
    ipcMain.on('sendUpdateModelAll', () => updateModelAll());

    ipcMain.on('sendUnsignedReestr', () => {
        sendUnsignedReestr();
        sendUnsignedReestrExport();
    });

    // planner
    let taskRegistersMd = {} as nodeCron.ScheduledTask;
    let taskReestrMonday = {} as nodeCron.ScheduledTask;
    let taskReestrThursday = {} as nodeCron.ScheduledTask;

    const plannerPA = async () => {
        bot.log.bot('register md log planner started');
        // updateRegister();
        await timePromise(15000);
        updateRDO();
    };

    ipcMain.on('sendPlannerRegisterMd', () => {
        if (taskRegistersMd) taskRegistersMd.stop();

        plannerPA();
        taskRegistersMd = nodeCron.schedule('0 0 */4 * * *', plannerPA);
    });

    return {
        updateModelAll,
        plannerPA,
        taskRegistersMd,
        taskReestrMonday,
        taskReestrThursday,
    };
};

export type PowerIpcT = ReturnType<typeof setPowerAUIpc>;
