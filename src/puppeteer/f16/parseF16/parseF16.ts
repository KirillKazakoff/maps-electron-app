import { parseInfo } from './parseInfo';
import { parseProdOutput } from './parseProdOutput';
import { parseProdInput } from './parseProdInput';
import { modifyCoefficientSpecial } from './modifyCoefficientRoe';
import { F16T, SSDT } from '../../../utils/types/f16';

export const parseF16 = (report: F16T) => {
    // check if empty report; destructure variable
    if (!report?.Report?.Tablix1) return null;
    const { SSD_DATE_Collection } = report.Report.Tablix1[0];
    if (!SSD_DATE_Collection) return null;

    const { SSD_DATE } = SSD_DATE_Collection[0];

    // reduce and parse report
    const parsedSSD = SSD_DATE.reduce<SSDT[]>((total, json) => {
        const output = parseProdOutput(json);
        const input = parseProdInput(json);
        modifyCoefficientSpecial({ input, output: output.current });

        const info = parseInfo(json);

        total.push({ info, production: { input, output } });

        return total;
    }, []);

    return parsedSSD;
};
