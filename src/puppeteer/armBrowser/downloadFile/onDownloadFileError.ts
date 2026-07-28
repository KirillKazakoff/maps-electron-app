import { bot } from '../../../bot/bot';

export const onDownloadFileError = async (intervalId: any, e: any) => {
    clearInterval(intervalId);

    bot.log.bot(e);
    throw new Error('error_restart');
    // const errorsRestart = [
    //     'calls for a higher timeout if needed',
    //     'User',
    //     'Session closed. Most likely the page has been closed',
    //     'Runtime.callFunctionOn timed out',
    //     'Protocol error (Target.createTarget)',
    //     'Navigation failed because browser has disconnected',
    //     'Requesting main frame too early!',
    //     'wait too much',
    //     'Navigation',
    //     'ERR_CONNECTION_CLOSED',
    // ];

    // // если ошибки из массива errorsRestart, то они обрабатываются в downloadF16Report
    // errorsRestart.forEach((option) => {
    //     if (e.message.includes(option)) {
    //         bot.log.bot('RELOAD');
    //         throw new Error('error_restart');
    //     }
    // });

    // // специальная ошибка, при срабатывании которой браузер не закрывается, итерация продолжается
    // if (e.message.includes('Отсутствует значение параметра')) {
    //     bot.log.bot('NO PARAM ERROR');
    //     return false;
    // }

    // // on unexpected error throw error further
    // bot.log.bot(e);
    // throw e;
};
