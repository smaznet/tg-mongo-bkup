import {sendLog, uploadFileToTelegram} from "./telegram.ts";


import * as fs from "node:fs";
import * as path from "node:path";

function execCommand(command: string, args: string[]) {
    return new Promise((resolve, reject) => {
        Bun.spawn([command, ...args], {
            onExit: (
                subprocess, exitCode, signalCode, error) => {
                if (exitCode === 0) {
                    resolve(signalCode)
                } else {
                    reject(error)
                }
            }
        });

    })
}

function removeOldsFiles() {
    let files = fs.readdirSync(process.env.OUT_DIR!);
    files.map(e => fs.unlinkSync(path.resolve(process.env.OUT_DIR!, e)));
}

export async function doBackup() {
    if (!fs.existsSync(process.env.OUT_DIR!)) {
        fs.mkdirSync(process.env.OUT_DIR!);
    }
    let fileName = `${process.env.OUT_DIR}/${new Date().getTime()}.tar.gz`;
    removeOldsFiles();
    await sendLog(`saving backup to ${fileName}`);
    let isWindows = process.platform === "win32";

    if (isWindows) {
        await execCommand(`mongodump`, [`/archive:${fileName}`, `/gzip`, `/uri:${process.env.MONGO_URI}`]);
    } else {
        await execCommand(`mongodump`, [`--archive=${fileName}`, `--gzip`, `--uri=${process.env.MONGO_URI}`]);

    }

    await handleUploadToTelegram(fileName);
}

async function handleUploadToTelegram(fileName: string) {
    console.log(`upload ${fileName} to telegram`);
    await sendLog(`Uploading backup ${fileName}`)
    await uploadFile(fileName);
    fs.unlinkSync(fileName);
}

async function uploadFile(file: string, partNumber = "") {
    let maxTries = 3;
    let fileName = `${process.env.FILE_PREFIX}-${new Date().toLocaleString()}.tar.gz${partNumber}`
    while (maxTries--) {
        let caption = `Backup of mongo db for ${process.env.FILE_PREFIX}
Date ${new Date().toLocaleString('fa-IR', {
            timeZone: "Asia/Tehran",
            calendar: "persian"
        })}`;
        let res = await uploadFileToTelegram(fileName, file, caption).catch(err => null)
        if (res) {
            break;
        }
    }

}
