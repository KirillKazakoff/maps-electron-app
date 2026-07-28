import { Page } from 'puppeteer';
import { bot } from '../../bot/bot';
import { timePromise } from '../../utils/time';
import { SettingsT } from '../../utils/types/types';
import { browser } from '../browser';

// page click navigation works badly and needs manualy timeout set to wait on load page

export async function login(settings: SettingsT): Promise<Page> {
    try {
        await browser.launch();
        if (!browser.instance) return;

        const page = await browser.instance.newPage();
        // page.setDefaultNavigationTimeout(0);

        // first navigate osm login
        await page.goto('https://osm.gov.ru/portal/login', { timeout: 80000 });
        await page.bringToFront();

        await page.evaluate((s) => {
            const inputs = {
                login: <HTMLInputElement>document.getElementById('id4'),
                password: <HTMLInputElement>document.getElementById('id5'),
            };

            inputs.login.value = s.login;
            inputs.password.value = s.password;
        }, settings);

        // second navigate osm login service portal
        await page.click('button.btn-danger');
        await timePromise(10000);

        const url = page.url();
        console.log(url);

        if (
            url === 'https://osm.gov.ru/fishery/loginRedirect' ||
            url === 'https://osm.gov.ru/portal/wicket/page?13'
        ) {
            await page.evaluate((s) => {
                const inputs = {
                    login: <HTMLInputElement>document.getElementById('id3'),
                    password: <HTMLInputElement>document.getElementById('id4'),
                };

                inputs.login.value = s.login;
                inputs.password.value = s.password;
            }, settings);

            // going to osm portal version service
            await page.click('button.btn-danger');

            console.log('wait 15');
            await timePromise(15000);

            // navigate to cfcm tab
            await page.click('.icon-home.chart');
            console.log('wait 20');
            await timePromise(20000);
        } else {
            // going to cfcm portal version regular
            console.log('wait 10');
            await timePromise(10000);
            await page.hover('.sub-navigation');
            await page.click('#id14');

            console.log('wait 20');
            await timePromise(20000);
        }

        console.log('on ARM');
        return page;
    } catch (e: any) {
        console.log('ERROR ON LOGIN OCCUR');
        // relaunch on error
        // await browser.check({ isError: true });
        bot.log.bot('OSM Login Error: ' + e.message);

        await browser.close({ isError: true });
        return await login(settings);
    }
}
