import xml2js from 'xml2js';
import fs from 'fs';
import { parseF16 } from './parseF16/parseF16';
import { getDirPathes } from '../fsModule/fsPathes';
import { moveF16Cloud } from './moveF16Cloud';
import { moveF16XmlDownloads } from './moveF16XmlDownloads';
import { SSDT } from '../../utils/types/f16';

const pathes = getDirPathes();

export const moveF16 = (status?: 'debug') => {
    moveF16XmlDownloads();
    const f16Array: SSDT[][] = [];

    console.log(status);
    const ssdFilesPath = status === 'debug' ? pathes.debugSSD : pathes.downloadsSSD;

    const ssdFileNames = fs.readdirSync(`${ssdFilesPath}`, {
        withFileTypes: true,
    });

    // read xml ssd => parse => rename and move to cloud
    ssdFileNames.forEach((file) => {
        if (!file.name.includes('Ф16') && !file.name.includes('SSD')) return;

        const filePath = `${ssdFilesPath}${file.name}`;
        const xml = fs.readFileSync(filePath);

        let currentSSD: SSDT[] | null = [];
        xml2js.parseString(xml, { mergeAttrs: true }, (err, result: any) => {
            if (err) {
                console.log(err);
                return;
            }

            const parsedF16 = parseF16(result);
            currentSSD = parsedF16;

            if (!parsedF16) return;

            // check if same ssd already in array
            const isSameVesselInParsed = parsedF16.some((ssdNew) => {
                return f16Array.some((f16) => {
                    return f16.some(
                        (ssdPrev) => ssdPrev.info.vessel_id === ssdNew.info.vessel_id
                    );
                });
            });
            if (isSameVesselInParsed) return;

            f16Array.push(parsedF16);
        });

        if (!currentSSD || currentSSD.length === 0) {
            fs.unlinkSync(filePath);
            return;
        }

        if (status === 'debug') return;

        moveF16Cloud(currentSSD, filePath);
    });

    console.log('ssd have been sent to the Cloud');
    return f16Array;
};
