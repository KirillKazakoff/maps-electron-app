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
        const pathToJson = ssdJson?.Subreport1?.[0]?.Report?.[0]?.Tablix8?.[0];

        // Тернарный оператор вместо if для быстрой валидации структуры
        if (!pathToJson?.Details6_Collection?.[0]?.Details6) return [];
        const detailsList = pathToJson.Details6_Collection[0].Details6;

        return detailsList.reduce<ProductionInputT[]>((total, row) => {
            const rawText = row.Textbox8?.[0] || '';

            // Безопасное извлечение подзоны: если текста нет, пишем 0
            const subzoneMatch = rawText.split('промысловая зона:')[1];
            const subzone = subzoneMatch ? +subzoneMatch.split('-')[0].trim() : 0;

            // Тернарный оператор для получения ID квоты напрямую из регулярного выражения
            const quoteReg = rawText.match(/"\((\d+)\)/);
            const quote = quoteReg ? +quoteReg[1] : null;

            // Если квота не найдена, логируем и пропускаем итерацию
            if (quote === null) {
                console.log('did not found quote id');
                return total;
            }

            row.Tablix2?.[0]?.Сведения_Collection?.[0]?.Сведения?.forEach((input) => {
                const [name, id, totalAmount] = Object.values(input).map((val) => val[0]);

                // Вытаскиваем ID продукта из скобок
                const parsedID = id ? +id.split(/[()]/)[1] : 0;

                total.push({
                    id: parsedID,
                    idSubzone: subzone,
                    idQuote: quote,
                    name: name || '',
                    total: totalAmount ? +totalAmount : 0,
                });
            });

            return total;
        }, []);
    } catch (e) {
        console.log('error while parsing prod input:\n');
        console.log(e);
        return [];
    }
};

// import { ReportF16T } from '../../../utils/types/f16';

// export type ProductionInputT = {
//     name: string;
//     total: number;
//     id: number;
//     idSubzone: number;
//     idQuote: number;
// };

// export const parseProdInput = (ssdJson: ReportF16T) => {
//     try {
//         if (!ssdJson.Subreport1) return [];

//         const pathToJson = ssdJson?.Subreport1[0]?.Report[0]?.Tablix8[0];

//         // check empty input
//         if (!pathToJson || !pathToJson.Details6_Collection) return [];
//         const detailsList = pathToJson.Details6_Collection[0].Details6;

//         // go foreach row Details6 => go second array Сведения => push each prodInput
//         const res = detailsList.reduce<ProductionInputT[]>((total, row) => {
//             const subzone = row.Textbox8[0].split('промысловая зона:')[1]?.split('-')[0].trim();
//             const quoteReg = row.Textbox8[0].match(/"\((\d+)\)/);
//             if (!quoteReg) {
//                 console.log('did not found quote id');
//                 return total;
//             }

//             const quote = quoteReg.length > 0 ? +quoteReg[1] : 0;

//             row.Tablix2[0].Сведения_Collection[0].Сведения.forEach((input) => {
//                 const [name, id, totalAmount] = Object.values(input).map((val) => val[0]);
//                 const parsedID = +id.split(/[()]/)[1];

//                 total.push({
//                     id: parsedID,
//                     idSubzone: +subzone,
//                     idQuote: quote,
//                     name,
//                     total: +totalAmount,
//                 });
//             });

//             return total;
//         }, []);

//         return res;
//     } catch (e) {
//         console.log(ssdJson);
//         console.log(e);
//         return [];
//     }
// };
