import Sntp from "@hapi/sntp";
import { app } from "@luodexun/container";
import { Logger } from "@luodexun/interfaces";
import * as _ from "lodash";

export const checkNTP = (hosts, timeout = 1000): any => {
    const logger = app.resolvePlugin<Logger.ILogger>("logger");

    return new Promise(async (resolve, reject) => {
        for (const host of _.shuffle(hosts)) {
            try {
                const time: Sntp.TimeOptions = await Sntp.time({ host, timeout });

                return resolve({ time, host });
            } catch (err) {
                logger.error(`Host ${host} responsed with: ${err.message}`);
            }
        }

        reject(new Error("Please check your NTP connectivity, couldn't connect to any host."));
    });
};
