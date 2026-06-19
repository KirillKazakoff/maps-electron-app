/* eslint-disable no-useless-escape */
import { ReportF16T } from '../../../utils/types/f16';

export const parseStatus = (json: ReportF16T) => {
    const table = json.Tablix5[0].Details3_Collection[0].Details3;
    const title = json.Textbox33[0];
    const titleSpaced = title.split(' ');

    const statusToken = titleSpaced[titleSpaced.length - 1].toLocaleLowerCase();
    const destinationReg = json.Textbox4[0].split(
        /(пункт следования).([\- \d]+)(.+)(ож. приход).([\d{2}\.]+).(.+)/
    );

    const initEvent = () => ({ time: 0, type: 'НЕ ОПРЕДЕЛЕН' });
    type EventT = ReturnType<typeof initEvent>;

    const status = {
        main: 'НЕИЗВЕСТЕН',
        place: '',
        placeId: 0,
        event: <EventT[]>[],
        destination: { eta: '', place: '', placeId: 0 },
    };

    // parse status
    if (statusToken === 'промысле') {
        status.main = 'НА ПРОМЫСЛЕ';
    }
    if (statusToken === 'порту') {
        status.main = 'В ПОРТУ';
    }

    if (destinationReg.length > 1) {
        status.destination.placeId = +destinationReg[2].split('-')[1].trim();

        status.destination.place = destinationReg[3];
        status.destination.eta = destinationReg[5];
    }
    // with destination point statuses
    if (statusToken === 'промысел') {
        status.main = 'СЛЕДУЕТ НА ПРОМЫСЕЛ';
    }
    if (statusToken === 'порт') {
        status.main = 'СЛЕДУЕТ В ПОРТ';
    }

    status.place = title.split(' - ')[1].split('°')[0];
    status.placeId = +title.split(' - ')[0].split(/\r\n/).pop();

    // parse meteo in tablix5
    const tokens = {
        'опер.поиск': 'Оперативный поиск',
        'метео прост. на пром': 'Простои метео',
        'выгрузка': 'Выгрузка',
        'переход с выгр.прод.': 'Переход с выгрузки',
        'хоз.работы': 'Хозяйственные работы',
        'проч.затраты лов.': 'Прочее лов',
        'траление': 'Траление',
        'межпутин.отстой': 'Межпутинный отстой',
        'прочие на пром-ле': 'Прочее промысел',
        'переход топл.снабж': 'Топливо снабжение',
        'бункеровка': 'Бункеровка',
        'груз.операц.в порту': 'Операции в порту',
        'ож.конт.оф.док.вых.п': 'Оформление документов',
        'ремонт.суд.мех.': 'Ремонт',
        'следует на пром.': 'Следует на промысел',
        'прочие в порту': 'Прочие в порту',
        'следует в порт': 'Следует в порт',
        'прием рп д/транстрт.': 'Прием рыбопродукции',
        'ожид.разреш.лов.': 'Ожидание разрешения лова',
    };

    status.event = table.reduce((total, row) => {
        if (!json.Tablix5) return total;
        if (!json.Tablix5[0].Details3_Collection) return total;
        if (!row?.USED_TIME_DESCRIPTION2) return total;

        // parse token
        Object.entries(tokens).forEach(([key, type]) => {
            const isToken = row.USED_TIME_DESCRIPTION2[0].includes(key);

            if (isToken) {
                // try find event if not init new and push
                let event = total.find((e) => e.type === type);
                if (!event) {
                    event = initEvent();
                    total.push(event);
                }

                event.type = type;
                event.time += +row.Textbox99[0];
            }
        });

        return total;
    }, [] as EventT[]);

    return status;
};
