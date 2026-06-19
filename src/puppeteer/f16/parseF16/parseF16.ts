import { parseInfo } from './parseInfo';
import { parseProdOutput } from './parseProdOutput';
import { parseProdInput } from './parseProdInput';
import { modifyCoefficientSpecial } from './modifyCoefficientRoe';
import { F16T, SSDT } from '../../../utils/types/f16';
import xml2js from 'xml2js';

export const parseF16 = (xml: Buffer, filePath: string) => {
    let parsedF16: SSDT[] = [];

    xml2js.parseString(xml, { mergeAttrs: true }, (err, report: F16T) => {
        if (err) {
            console.log(err);
            return;
        }
        // check if empty report; destructure variable
        if (!report?.Report?.Tablix1) return null;
        const { SSD_DATE_Collection } = report.Report.Tablix1[0];
        if (!SSD_DATE_Collection) return null;

        const { SSD_DATE } = SSD_DATE_Collection[0];

        // reduce and parse report
        parsedF16 = SSD_DATE.reduce<SSDT[]>((total, json) => {
            const output = parseProdOutput(json);
            const input = parseProdInput(json);
            modifyCoefficientSpecial({ input, output: output.current });

            const info = parseInfo(json);

            const isLive = output.board.some((prod) => prod.name.includes('жив'));

            total.push({
                info,
                production: {
                    input,
                    output,
                    isLive,
                },
                filePath,
            });

            return total;
        }, []);
    });

    return parsedF16;
};
