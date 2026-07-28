import { browser } from '../browser';
import { FormDateT } from '../../UI/stores/settingsStore';
import { downloadFile } from '../armBrowser/downloadFile/downloadFile';
import { login } from '../armBrowser/login';
import { parseF16List } from './parseF16/parseF16List';
import { bot } from '../../bot/bot';
import { settings } from '../fsModule/readConfig';
import { moveF16Cloud } from './moveF16Cloud';

export const downloadF16Report = async (date: FormDateT, vesselsArray: string[]) => {
    // close any connections in case if prev dont exit for any reason
    await browser.close({ isError: false });

    // remove dublicates if they are
    let vessels = Array.from(new Set(vesselsArray));

    const recurseLoad = async () => {
        // login to osm, if unexpected error throw to setOsm
        const loginStatus = await login(settings);

        // remember currentId to restart if error occur
        let currentId = vessels[0];

        // download f16 reports by vessel id list
        for await (const id of vessels) {
            try {
                // check status login here if first login error (program won't restart!)
                if (!loginStatus) throw new Error('no_login');
                console.log(id);

                currentId = id;
                await downloadFile({
                    url: `https://mon.cfmc.ru/ReportViewer.aspx?Report=34&IsAdaptive=false&VesselShipId=${id}&StartDate=${date.start}&EndDate=${date.end}`,
                    docType: 'xml',
                    timers: browser.timers,
                    timeout: 300000,
                });

                await browser.check({ isError: false });
            } catch (e: any) {
                // throw next to osm catch unexpected errors
                if (e.message !== 'error_restart') {
                    throw e;
                }

                // if error_restart occurs while download file then restart browser
                vessels = vessels.slice(vessels.indexOf(currentId));
                bot.log.bot('F16 report not downloaded, restart ' + 'on vessel id ' + id);

                await browser.close({ isError: true });

                await recurseLoad();
                return;
            }
        }

        // close browser + refresh error count
        await browser.close({ isError: false });
    };

    await recurseLoad();

    const f16List = parseF16List('downloadsSSD');
    moveF16Cloud(f16List);

    bot.log.bot('SSD F16 uploaded successfuly');

    return f16List;
};
