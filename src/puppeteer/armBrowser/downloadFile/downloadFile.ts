import { Page } from 'puppeteer';
import { browser } from '../../browser';
import { onDownloadFileError } from './onDownloadFileError';
import { waitReportLoad } from './waitReportLoad';
import { timePromise } from '../../../utils/time';

type Params = {
    url?: string;
    timers: NodeJS.Timeout[];
    docType: 'xml' | 'xlsx';
    page?: Page;
    timeout?: number;
};

export const downloadFile = async ({ url, timers, docType, page: pg, timeout }: Params) => {
    if (!browser.instance) {
        throw new Error('no browser on download file');
    }

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types, prefer-const
    let intervalId = null as unknown as NodeJS.Timeout;

    try {
        let page = pg;

        if (!page && url) {
            page = await browser.instance.newPage();
            await page.goto(url, { timeout: 100000 });
        }
        if (!page) return;

        await waitReportLoad({ intervalId, browser, page, watchEl: 'span', timeout });

        console.log('WAIT DONE');

        // await timePromise(100000);
        const selectorMenu = '#ReportViewer1_ctl05_ctl04_ctl00';
        const selectorXMLOption =
            docType === 'xml' ? 'a[title="XML-файл с данными отчета"]' : 'a[title="Excel"]';
        await page.click(selectorMenu);
        await page.click(selectorXMLOption);

        if (docType === 'xlsx') {
            await timePromise(45000);
        }

        timers.push(setTimeout(() => page.close(), 20000));
    } catch (e) {
        await onDownloadFileError(intervalId, e);
    }
};
