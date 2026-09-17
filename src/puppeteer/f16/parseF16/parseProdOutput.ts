import { ReportF16T } from '../../../utils/types/f16';

// Описание структуры объекта готовой продукции (ID, название, объем, сорт, коэффициент)
export type ProductionOutputT = {
    idProduct: number;
    name: string;
    total: number;
    sort: string;
    coefficient: number;
};

// Словарь для упрощения сложных названий продукции в более читаемые
const prodReplaceDictionary = {
    'икра минт яст мор зрел': 'икра минт ST',
    'икра минт яст мор пищ нестанд': 'икра минт',
};

/**
 * Функция замены названий продукции по словарю
 * Если в исходном названии есть подстрока из словаря, она заменяется на новое значение
 */
const prodNameReplace = (name: string) => {
    let newName = name;

    Object.entries(prodReplaceDictionary).forEach(([key, value]) => {
        if (name.includes(key)) {
            newName = value;
        }
    });

    return newName;
};

/**
 * Парсер входящих данных таблицы в массив объектов ProductionOutputT
 * Принимает строку (для валидации) или массив объектов с массивами строк внутри
 */
const parseTable = (table: string | { [key: string]: string[] }[]) => {
    if (!table || typeof table === 'string') return [];

    // Преобразуем массив строк таблицы в итоговый массив продукции через метод reduce
    return table.reduce<ProductionOutputT[]>((total, details) => {
        // Извлекаем первый элемент из массива значений каждого свойства объекта строки
        const resArr = Object.values(details).map((detail) => detail[0]);

        const [name, id, value, suffix, type] = resArr;
        const parsedID = +id.split(/[()]/)[1];

        // Фильтр: обрабатываем только те строки, которые относятся к собственному сырью
        if (!type.includes('вып. из собственного сырья')) return total;

        // Разбиваем строку названия по пробелам для определения сорта
        const nameArr = name.split(' ');
        let sort = nameArr[nameArr.length - 1];
        if (!sort) sort = '';

        // Собираем название обратно в строку
        const nameParsed = nameArr.join(' ');

        // Формируем объект продукции
        const obj: ProductionOutputT = {
            idProduct: parsedID,
            name: prodNameReplace(nameParsed),
            total: +value,
            sort,
            coefficient: 0,
        };
        total.push(obj);

        return total;
    }, []);
};

/**
 * Главный парсер отчета F16
 * Разделяет данные на суточные показатели и итоговые по борту судна
 */
export const parseProdOutput = (ssdJson: ReportF16T) => {
    // Безопасно извлекаем коллекцию (данные по суткам) из Tablix9 (может быть undefined)
    const detailsCurrentCollection = ssdJson.Tablix9[0]?.Details7_Collection[0];
    const detailsTotal = ssdJson.Tablix11[0].Details9_Collection[0].Details9;

    const output = {
        current: <ProductionOutputT[]>[], // Текущий выпуск
        board: <ProductionOutputT[]>[], // Нарастающий итог на борту
    };

    // Если есть данные по борту, парсим их в массив board
    if (detailsTotal) output.board = parseTable(detailsTotal);

    // Проверяем, что коллекция с суточными данными существует и является объектом
    const isCurrent = typeof detailsCurrentCollection === 'object' && detailsCurrentCollection;

    if (isCurrent) {
        // Превращаем свойства объекта Details7 в итерируемый массив строк и парсим
        const detailsCurrent = Object.values(detailsCurrentCollection.Details7);
        output.current = parseTable(detailsCurrent);
    }

    return output;
};
