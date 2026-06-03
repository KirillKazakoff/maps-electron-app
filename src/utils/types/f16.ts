import reportJson from '../../filesDebug/reportNew.json';
import { SSDInfoT } from '../../puppeteer/f16/parseF16/parseInfo';
import { ProductionInputT } from '../../puppeteer/f16/parseF16/parseProdInput';
import { ProductionOutputT } from '../../puppeteer/f16/parseF16/parseProdOutput';

export type F16T = typeof reportJson;
export type ReportF16T = F16T['Report']['Tablix1'][0]['SSD_DATE_Collection'][0]['SSD_DATE'][0];

export type SSDT = {
    info: SSDInfoT;
    production: {
        input: ProductionInputT[];
        output: {
            current: ProductionOutputT[];
            board: ProductionOutputT[];
        };
    };
    type?: string;
};
