import { ReportF16T } from '../../../utils/types/f16';

export type ProductionInputT = {
    name: string;
    total: number;
    id: number;
    idSubzone: number;
    idQuote: number;
};

export const parseProdInput = (ssdJson: ReportF16T) => {
    try {
        if (!ssdJson.Subreport1) return [];

        const pathToJson = ssdJson?.Subreport1[0]?.Report[0]?.Tablix8[0];

        // check empty input
        if (!pathToJson || !pathToJson.Details6_Collection) return [];
        const detailsList = pathToJson.Details6_Collection[0].Details6;

        // go foreach row Details6 => go second array Сведения => push each prodInput
        const res = detailsList.reduce<ProductionInputT[]>((total, row) => {
            const subzone = row.Textbox8[0].split('промысловая зона:')[1].split('-')[0].trim();
            const quoteReg = row.Textbox8[0].match(/"\((\d+)\)/);
            if (!quoteReg) {
                console.log('did not found quote id');
                return total;
            }

            const quote = quoteReg.length > 0 ? +quoteReg[1] : 0;

            row.Tablix2[0].Сведения_Collection[0].Сведения.forEach((input) => {
                const [name, id, totalAmount] = Object.values(input).map((val) => val[0]);
                const parsedID = +id.split(/[()]/)[1];

                total.push({
                    id: +parsedID,
                    idSubzone: +subzone,
                    idQuote: quote,
                    name,
                    total: +totalAmount,
                });
            });

            return total;
        }, []);

        return res;
    } catch (e) {
        console.log(ssdJson);
        console.log(e);
        return [];
    }
};
