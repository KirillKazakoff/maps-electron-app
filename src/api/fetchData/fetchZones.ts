import { settings } from '../../puppeteer/fsModule/readConfig';
import { login } from '../../puppeteer/armBrowser/login';
import { setFunctionsInPageContext } from '../../puppeteer/setFunctionsInPageContext';

export async function sendZones() {
    const page = await login(settings);
    if (!page) return;

    const functions = setFunctionsInPageContext(page);
    return await functions.fetchZones();
}
