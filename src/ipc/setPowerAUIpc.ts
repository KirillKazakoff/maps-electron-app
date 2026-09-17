/* eslint-disable prefer-const */
import { ipcMain } from 'electron';
import { bot } from '../bot/bot';
import { timePromise } from '../utils/time';
import { updateRDO } from '../powershell/updateRDO';
import {
    sendUnsignedReestr,
    sendUnsignedReestrExport,
} from '../powershell/sendUnsignedReestr';
import { runVBS } from '../powershell/runVBS';

export const setPowerAUIpc = () => {
    const reportsTGTask = async () => {
        await bot.doc.pdf({ type: 'vessel', name: 'Судовой отчет' });
        await bot.doc.pdf({ type: 'tech', name: 'Технический отчет' });
    };

    // send check reestr task
    ipcMain.on('sendUnsignedReestr', () => {
        sendUnsignedReestr();
        sendUnsignedReestrExport();
    });

    // separated commands (model task divided on parts)
    ipcMain.on('sendUpdateMd', () => runVBS('update_db.vbs'));
    ipcMain.on('sendUpdateModel', () => runVBS('update_model.vbs'));
    ipcMain.on('sendReportDebug', () => reportsTGTask());
    ipcMain.on('sendUpdateModelAll', () => modelTask());

    // full model task
    const modelTask = async () => {
        try {
            await runVBS('update_db.vbs');
            await timePromise(5000);

            await runVBS('update_model.vbs');
            await timePromise(5000);

            await reportsTGTask();
        } catch (e: any) {
            bot.log.bot('UNEXPECTED ERROR on VBScript: ' + e.message);
        }
    };

    // utility update tasks
    const RdoTask = async () => {
        bot.log.bot('register md log planner started');
        // updateRegister();
        await timePromise(15000);
        updateRDO();
    };

    return {
        modelTask,
        RdoTask,
    };
};

export type PowerIpcT = ReturnType<typeof setPowerAUIpc>;
