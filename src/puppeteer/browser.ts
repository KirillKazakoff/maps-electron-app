/* eslint-disable import/no-named-as-default-member */
import puppeteer, { Browser } from 'puppeteer';
import { timePromise } from '../utils/time';
import { bot } from '../bot/bot';

class BrowserC {
    instance: Browser | undefined;
    // timers that initiated while download from osm
    timers: NodeJS.Timeout[] = [];
    errorTimes = 0;
    maxError = 20;

    async launch() {
        if (this.instance) {
            await this.instance.close();
        }

        this.instance = await puppeteer.launch({
            devtools: true,
            headless: false,
        });
    }

    async close() {
        if (!this.instance) return;

        await this.instance.close();
        this.instance = null as any;

        this.timers.forEach((timer) => clearTimeout(timer as unknown as number));

        await timePromise(5000);
    }

    async check(settings: { isError: boolean }) {
        const { isError } = settings;
        // refresh if no error

        if (isError) {
            bot.log.bot(`Error count: ${this.errorTimes}`);
            this.errorTimes += 1;
        } else {
            this.errorTimes = 0;
            return;
        }

        // make cooldown if many errors
        let cooldown = 2000;

        if (this.errorTimes >= this.maxError) {
            cooldown = 3600 * 1000;
            this.errorTimes = 0;
            bot.log.tech('OSM портал по техническим причинам недоступен');

            await timePromise(cooldown);
        }
    }
}

export const browser = new BrowserC();

export type BrowserT = typeof browser;

// /* eslint-disable import/no-named-as-default-member */
// import puppeteer, { Browser } from 'puppeteer';
// import { timePromise } from '../utils/time';
// import { bot } from '../bot/bot';

// class BrowserC {
//     instance: Browser | undefined;
//     errorTimes = 0;

//     async launch() {
//         if (this.instance) {
//             await this.instance.close();
//         }

//         this.instance = await puppeteer.launch({
//             devtools: true,
//             headless: false,
//         });
//     }

//     async close() {
//         if (!this.instance) return;
//         await this.instance.close();
//         this.instance = null as any;

//         await timePromise(2500);
//     }

//     async clear(timers: NodeJS.Timer[] | null, isError: boolean) {
//         // refresh if no error
//         if (isError) {
//             bot.log.bot(`Error count: ${this.errorTimes}`);
//             this.errorTimes += 1;
//         } else {
//             this.errorTimes = 0;
//             return;
//         }

//         // make cooldown if many errors
//         let cooldown = 2000;

//         if (this.errorTimes >= 20) {
//             cooldown = 3600 * 1000;
//             this.errorTimes = 0;
//             bot.log.tech('OSM портал по техническим причинам недоступен');
//         }
//         await timePromise(8000);

//         if (timers) {
//             timers.forEach((timer) => clearTimeout(timer as unknown as number));
//         }
//         await this.close();

//         await timePromise(cooldown);
//     }
// }

// export const browser = new BrowserC();

// export type BrowserT = typeof browser;
