import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const mainPath = 'C:\\Users\\admin\\Desktop\\Projects\\maps-electron\\src\\powershell\\vbs\\';

export async function runVBS(scriptName: string) {
    console.log('Запуск обновления Excel...');

    try {
        // Ожидаем завершения работы VBS-скрипта (минимум 45 секунд)
        await execPromise(`wscript.exe "${mainPath}\\${scriptName}"`);

        // Этот код выполнится строго после того, как Excel закроется
        console.log('Процесс успешно завершен!');
    } catch (error: any) {
        // Если скрипт завершился с ошибкой, мы поймаем её здесь
        console.error(`Произошла ошибка выполнения: ${error.message}`);
    }
}

// execPromise(`wscript.exe "${mainPath}\\${scriptName}"`, (error, stdout, stderr) => {
