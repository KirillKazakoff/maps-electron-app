import fs from 'fs';
import { parseF16 } from './parseF16';
import { getDirPathes } from '../../fsModule/fsPathes';
import { moveF16XmlDownloads } from '../moveF16XmlDownloads';
import { SSDT } from '../../../utils/types/f16';

const pathes = getDirPathes();

export const parseF16List = (path: keyof typeof pathes) => {
    moveF16XmlDownloads();

    const ssdDir = pathes[path];
    const ssdFileNames = fs.readdirSync(ssdDir, {
        withFileTypes: true,
    });

    const f16Array: SSDT[][] = [];

    // read xml ssd => parse => rename and move to cloud
    ssdFileNames.forEach((file) => {
        if (!file.name.includes('Ф16') && !file.name.includes('SSD')) return;

        const filePath = `${ssdDir}${file.name}`;
        const xml = fs.readFileSync(filePath);

        const SSD = parseF16(xml, filePath);

        // if new ssd is empty dont move to cloud
        if (!SSD || SSD.length === 0) {
            fs.unlinkSync(filePath);
            return;
        }
        // check if same ssd already in array
        const isSameVesselInParsed = SSD.some((ssdNew) => {
            return f16Array.some((f16) => {
                return f16.some((ssdPrev) => ssdPrev.info.vessel_id === ssdNew.info.vessel_id);
            });
        });
        if (isSameVesselInParsed) return;

        f16Array.push(SSD);
    });

    console.log('ssd have been sent to the Cloud');
    return f16Array;
};
