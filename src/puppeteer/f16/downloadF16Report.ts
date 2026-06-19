import { browser } from '../browser';
import { FormDateT } from '../../UI/stores/settingsStore';
import { downloadFile } from '../armBrowser/downloadFile/downloadFile';
import { login } from '../armBrowser/login';
import { parseF16List } from './parseF16/parseF16List';
import { bot } from '../../bot/bot';
import { settings } from '../fsModule/readConfig';
import { moveF16Cloud } from './moveF16Cloud';

export const downloadF16Report = async (date: FormDateT, vesselsArray: string[]) => {
    // remove dublicates
    let vessels = Array.from(new Set(vesselsArray));

    const recurseLoad = async () => {
        const timers: NodeJS.Timeout[] = [];
        const loginStatus = await login(settings);

        let currentId = vessels[0];

        // download f16 reports by vessel id list
        for await (const id of vessels) {
            try {
                // check status login here if first login error
                if (!loginStatus) throw new Error('no_login');
                console.log(id);

                currentId = id;
                await downloadFile({
                    url: `https://mon.cfmc.ru/ReportViewer.aspx?Report=34&IsAdaptive=false&VesselShipId=${id}&StartDate=${date.start}&EndDate=${date.end}`,
                    docType: 'xml',
                    timers,
                    timeout: 200000,
                });
            } catch (e) {
                // if error_restart occurs while download file
                vessels = vessels.slice(vessels.indexOf(currentId));
                bot.log.bot('F16 report not downloaded, restart ' + 'on vessel id ' + id);

                await browser.clear(timers, true);
                await recurseLoad();
                return;
            }
        }

        await browser.clear(timers, false);
    };

    await recurseLoad();

    const f16List = parseF16List('downloadsSSD');
    moveF16Cloud(f16List);

    bot.log.bot('SSD F16 uploaded successfuly');

    return f16List;
};
