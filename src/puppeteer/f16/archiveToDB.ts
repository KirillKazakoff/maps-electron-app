import fs from 'fs';
import path from 'path';
import { SSDT } from '../../utils/types/f16';
import { parseF16 } from './parseF16/parseF16';

export const archiveToDB = () => {
    const ROOT_DIR = 'C:\\Users\\admin\\Dropbox\\Семейная папка\\ССД расшиф v2\\Архив\\2024';
    const f16Array: SSDT[][] = [];

    function processDirectoryRecursive(dirPath: string) {
        try {
            // Читаем содержимое текущей директории
            const items = fs.readdirSync(dirPath, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);

                if (item.isDirectory()) {
                    // Если это папка -> заходим внутрь (рекурсия)
                    processDirectoryRecursive(fullPath);
                } else if (item.isFile()) {
                    // may occur beated files, detect here
                    try {
                        const xml = fs.readFileSync(fullPath);
                        const SSD = parseF16(xml, fullPath);

                        f16Array.push(SSD);
                    } catch (e) {
                        console.log(fullPath);
                    }
                }
            }

            console.log('next month');
        } catch (error) {
            console.error(`❌ Ошибка при обработке директории ${dirPath}:`, error);
        }
    }

    processDirectoryRecursive(ROOT_DIR);
    console.log('✅ Обработка успешно завершена!');

    // console.log(f16Array);
    return f16Array;
};
