import cron from "node-cron";
import {doBackup} from "./mongo.ts";
import {startClient} from "./telegram.ts";

export async function bootstrap() {
    try {
        await startClient();

    } catch (err) {
        console.log("client init fail!", err)
    }
    cron.schedule(process.env.CRON!, () => {
        console.log('Running a job at 01:00 at America/Sao_Paulo timezone');
        doBackup();
    }, {
        scheduled: true,
        timezone: "Asia/Tehran"
    });
    doBackup();
}
