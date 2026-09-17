import { F19T } from '../../utils/types/f19';
import xml2js from 'xml2js';
import fs from 'fs';
import { vessels } from '../fsModule/readConfig';

export const parseF19 = ({ filePath }: { filePath: string }) => {
    const newVessels: string[] = [];
    const xml = fs.readFileSync(filePath);

    xml2js.parseString(xml, { mergeAttrs: true }, (err, res: F19T) => {
        if (err) {
            console.log(err);
            return;
        }

        const details = res.Report.Tablix1[0].Details_Collection[0].Details;

        if (!details) return null;

        details.forEach(({ VES2: vessel, FISH: product }) => {
            const id = vessel[0].split(/[()]/)[1];
            const isEqualRecord = vessels.main.some((v) => v === id);
            const isCrab = product && product[0].includes('краб');
            const isException = vessels.exception.some((v) => v === id);

            if (!product) return;

            if (!isEqualRecord && !isException && isCrab) {
                newVessels.push(id);
            }

            // cut if exeption already in vessel list
            if (isException) {
                const index = vessels.main.indexOf(id);
                if (index === -1) return;

                vessels.main.splice(index, 1);
            }
        });
    });

    return newVessels;
};
