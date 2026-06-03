import { ReportF16T } from '../../../utils/types/f16';
import { Reserve } from '../../../api/models';

export const parseReserve = (id_ssd: string, ssdJson: ReportF16T) => {
    const reserveJson = ssdJson.Tablix7[0].Details5_Collection[0].Details5;
    const reserve = reserveJson.reduce<Reserve>(
        (total, reserveType) => {
            const [type, id, amount] = Object.values(reserveType).map((val) => val[0]);
            if (type === 'вода-запас') {
                total.water = +amount;
            } else if (type === 'дизтопливо-запас') {
                total.fuel = +amount;
            }
            return total;
        },
        { id_ssd, water: 0, fuel: 0 }
    );

    return reserve;
};
