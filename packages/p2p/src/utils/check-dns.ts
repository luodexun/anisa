import { app } from "@luodexun/container";
import { Logger } from "@luodexun/interfaces";
import dns from "dns";
import * as _ from "lodash";
import util from "util";

export const checkDNS = async hosts => {
    hosts = _.shuffle(hosts);

    const lookupService = util.promisify(dns.lookupService);

    for (let i = hosts.length - 1; i >= 0; i--) {
        try {
            await lookupService(hosts[i], 53);

            return Promise.resolve(hosts[i]);
        } catch (err) {
            app.resolvePlugin<Logger.ILogger>("logger").error(err.message);
        }
    }

    return Promise.reject(new Error("Please check your network connectivity, couldn't connect to any host."));
};
