import { getDirPathes } from '../fsModule/fsPathes';
import { vessels, rewriteConfig } from '../fsModule/readConfig';
import { bot } from '../../bot/bot';
import { parseF19 } from './parseF19';
import { processReports } from '../fsModule/processReports';

const xmlPathes = getDirPathes();

// search for f19 xlsx and xml files in downloads dir
type SettingsT = { isUpdateConfig: boolean; date: string };

export const operateF19 = ({ isUpdateConfig, date }: SettingsT) => {
    processReports({
        formCode: 'Ф19',
        getTargetConfig: ({ ext }) => {
            const config = { targetDir: '', newFileName: '' };

            if (ext === 'xlsx') {
                config.newFileName = `${date}.xlsx`;
                config.targetDir = xmlPathes.f19;
            }
            return config;
        },
        onSuccess: ({ filePath, ext }) => {
            if (!isUpdateConfig) return;
            if (ext !== 'xml') return;

            // add new vessels to config
            const newVessels = parseF19({ filePath });
            const setVessels = Array.from(new Set(newVessels));

            if (setVessels.length > 0) {
                bot.log.bot('new vessels registered are ' + setVessels.join(' '));
            }

            // fsWrite new vessels
            vessels.main.push(...setVessels);

            // removeDublicates
            const vesselList = Array.from(new Set(vessels.main));
            vessels.main = [...vesselList];

            rewriteConfig();
        },
    });

    bot.log.botDated(`F19 report xml xlsx loaded`);
};
