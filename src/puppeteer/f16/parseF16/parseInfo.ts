import { parseStatus } from './parseStatus';
import { parseTrap } from './parseTrap';
import { DateTime } from 'luxon';
import { ReportF16T } from '../../../utils/types/f16';

// eslint-disable-next-line no-useless-escape
const rgBracket = /[\(\)]/;

export const parseInfo = (json: ReportF16T) => {
    const title = json.Textbox33[0];
    const titleSpaced = title.split(' ');
    const agreementNoSpaced = titleSpaced[titleSpaced.indexOf('№') + 1].split('\r\n');
    const date = titleSpaced[0];

    const coordinates = title.match(/\d+°\d+[NS]\s+\d+°\d+[EW]/)?.[0];
    const dateYesterday = DateTime.now().minus({ day: 1 }).toFormat('dd.MM.yyyy');
    const vessel_id = title.split(rgBracket)[1];
    const company_id = title.match(/(?<=___\/ [^(]*\()\d+(?=\))/)?.[0];

    const dateNoDot = date.replaceAll('.', '');
    const dt = DateTime.fromFormat(dateNoDot, 'ddMMyyyy');
    const dtReversed = dt.toFormat('yyyyMMdd');
    const id = +`${dtReversed}${vessel_id}`;

    console.log(id);

    return {
        id,
        vessel_name: title.split(rgBracket)[0].substring(10, 100).trim(),

        agreement_no: agreementNoSpaced[0],
        catch_zone_id: agreementNoSpaced[1],
        isTransport: titleSpaced[9] === 'ТР',
        trapData: parseTrap(json),
        isOutdated: dateYesterday !== date,
        status: parseStatus(json),
        coordinates,
        vessel_id,
        company_id,
        date,
    };
};

export type SSDInfoT = ReturnType<typeof parseInfo>;
