import fs from 'fs';
import path from 'path';
import { getDirPathes } from './fsPathes';

// Описываем интерфейс для возвращаемого значения функции конфигурации
type TargetConfig = {
    targetDir: string;
    newFileName: string;
};

// Описываем интерфейс для аргумента onSuccess
type SuccessCallbackArgs = {
    originalName: string;
    newFileName: string;
    filePath: string;
    ext: string;
};

type GetTargetConfigT = { fileName: string; ext: string };

// Описываем интерфейс для входящих параметров основной функции
type ProcessReportsOptions = {
    formCode: string;
    getTargetConfig: ({ fileName, ext }: GetTargetConfigT) => TargetConfig | null;
    onSuccess?: (args: SuccessCallbackArgs) => void;
};

//Универсальный обработчик и перемещатель файлов отчетов
//Иттерирует папку загрузок, находит нужный отчет, переименовывает и перенаправляет его в облако
export const processReports = ({
    formCode,
    getTargetConfig,
    onSuccess,
}: ProcessReportsOptions): void => {
    const xmlPathes = getDirPathes();
    const files = fs.readdirSync(xmlPathes.downloads, { withFileTypes: true });

    files.forEach((file: fs.Dirent) => {
        if (!file.isFile() || !file.name.includes(formCode)) return;
        const extension = file.name.match(/\.([^.]+)$/)?.[1];

        const filePath = path.join(xmlPathes.downloads, file.name);
        const config = getTargetConfig({ fileName: file.name, ext: extension });

        if (!config.targetDir) return;

        const { targetDir, newFileName } = config;
        const newFilePath = path.join(targetDir, newFileName);

        fs.copyFileSync(filePath, newFilePath);
        fs.unlinkSync(filePath);

        if (onSuccess) {
            onSuccess({ originalName: file.name, newFileName, filePath, ext: extension });
        }
    });
};
