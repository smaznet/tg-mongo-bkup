import {TelegramClient} from "telegram";
import {StringSession} from "telegram/sessions";
import * as fs from "node:fs";
import {CustomFile} from "telegram/client/uploads";


const apiId = +process.env.TELEGRAM_API_ID!;
const apiHash = process.env.TELEGRAM_API_HASH!;
const destChat = +process.env.DEST_CHAT_ID!;
const botToken = process.env.BOT_TOKEN!;
let sessionFile = 'session.bkup'
let client: TelegramClient;

export async function startClient() {
    let session = '';
    try {
        session = await fs.promises.readFile(sessionFile, 'utf-8');
    } catch (err) {

    }
    const stringSession = new StringSession(session);
    if (client) {
        await client?.disconnect();

    }
    client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 6000,
        autoReconnect: true,
    });
    await client.start({
        botAuthToken: process.env.BOT_TOKEN!
    });

    let entity;
    try {
        entity = await client.getInputEntity(destChat);
    } catch (err) {
        console.log("Entity not found tring send message using api to know entity")
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${destChat}&text=Hi%20there!`);
        entity = await client.getInputEntity(destChat).catch(err => null);
        if (!entity) {
            console.log("Dest channel not found")
            process.exit(1)
        }

    }


    await client.sendMessage(entity, {
        message: "Backup process started"
    });
    await fs.promises.writeFile(sessionFile, stringSession.save(), 'utf-8');

}

export async function sendLog(text: string) {
    try {
        await client.sendMessage(destChat, {
            message: text
        });
    } catch (err) {
        if (client.disconnected) {
            await startClient();
            await sendLog(text);
        }
    }

}

export async function uploadFileToTelegram(fileName: string, filePath: string, caption: string) {

    const toUpload = new CustomFile(fileName, fs.statSync(filePath).size, filePath);

    return await client.sendFile(destChat, {
        file: toUpload,
        caption
    })
}



