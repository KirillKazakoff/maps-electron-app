import { DateTime } from 'luxon';
import TelegramBot from 'node-telegram-bot-api';
import { botSetup as setup } from './botSetup';

type TextT = string | number;
type LogT = { id: number; text: TextT; options?: TelegramBot.SendMessageOptions };
const { chat: chat, api } = setup;

// Функция для разбивки текста на массив строк
function splitMessage(text: string, maxLength = 4000) {
    const chunks = [];
    let currentChunk = '';

    // Разделяем по строкам, чтобы не рвать слова посередине
    const lines = text.split('\n');

    for (const line of lines) {
        if ((currentChunk + line).length > maxLength) {
            chunks.push(currentChunk);
            currentChunk = '';
        }
        currentChunk += line + '\n';
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk);
    }

    return chunks;
}

export class BotLog {
    log(log: LogT) {
        api.sendMessage(log.id, log.text.toString(), {
            ...log?.options,
            parse_mode: 'HTML',
        });
    }

    reports(text: string) {
        this.log({ text, ...chat.reports });
    }
    ovedDocs(text: TextT) {
        this.log({ text, ...chat.ovedDocuments });
    }
    ovedExport(text: TextT) {
        this.log({ text, ...chat.ovedExport });
    }
    tech(text: TextT) {
        this.log({ text, ...chat.tech });
    }
    bot(text: TextT) {
        this.log({ text, ...chat.bot });
    }

    botDated(text: TextT) {
        const dateStr = DateTime.now().toFormat('dd-MM-yyyy');
        this.bot(`${text} ${dateStr}`);
    }
}

export const botLog = new BotLog();
