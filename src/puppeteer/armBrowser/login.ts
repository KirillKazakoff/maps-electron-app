import { SettingsT } from '../../utils/types/types';
import { bot } from '../../bot/bot';
import { timePromise } from '../../utils/time';
import { browser } from '../browser';

// page click navigation works badly and needs manualy timeout set to wait on load page

export async function login(settings: SettingsT) {
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

            await timePromise(15000);

            // navigate to cfcm tab
            await page.click('.icon-home.chart');
            await timePromise(10000);
        } else {
            // going to cfcm portal version regular
            await timePromise(10000);
            await page.hover('.sub-navigation');
            await page.click('#id14');
            await timePromise(12000);
        }

        console.log('on ARM');
        return page;
    } catch (e: any) {
        // relaunch on error
        await browser.clear(null, true);
        bot.log.bot('OSM Login Error: ' + e.message);
        await login(settings);

        return false;
    }
}
