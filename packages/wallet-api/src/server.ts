import { createServer, mountServer } from "./utils";
import * as plugins from "./plugins";
import Hapi from "@hapi/hapi";
import Bcrypt from "bcrypt";
// import { get } from "dottie";

export class Server {
    private http: any;
    private https: any;

    public constructor(private config: any) {}

    public async start(): Promise<void> {
        const options = {
            host: this.config.host,
            port: this.config.port,
        };

        if (this.config.enabled) {
            this.http = await createServer(options);
            this.http.app.config = this.config;

            this.registerPlugins("HTTP", this.http);
        }

        if (this.config.ssl.enabled) {
            this.https = await createServer({
                ...options,
                ...{ host: this.config.ssl.host, port: this.config.ssl.port },
                ...{ tls: { key: this.config.ssl.key, cert: this.config.ssl.cert } },
            });
            this.https.app.config = this.config;

            this.registerPlugins("HTTPS", this.https);
        }
    }

    public async stop(): Promise<void> {
        if (this.http) {
            console.log(`Stopping Public HTTP API`);
            await this.http.stop();
        }

        if (this.https) {
            console.log(`Stopping Public HTTPS API`);
            await this.https.stop();
        }
    }

    public async restart(): Promise<void> {
        if (this.http) {
            await this.http.stop();
            await this.http.start();
        }

        if (this.https) {
            await this.https.stop();
            await this.https.start();
        }
    }

    public instance(type: string): Hapi.Server {
        return this[type];
    }

    private async registerPlugins(name: string, server: Hapi.Server): Promise<void> {
        await server.register({ plugin: plugins.contentType });

        await server.register({
            plugin: plugins.corsHeaders,
        });

        // await server.register({
        //     plugin: plugins.whitelist,
        //     options: {
        //         whitelist: this.config.whitelist,
        //     },
        // });

        await server.register({
            plugin: require("./plugins/set-headers"),
        });

        await server.register(plugins.hapiAjv);

        await server.register({
            plugin: require("hapi-rate-limit"),
            options: this.config.rateLimit,
        });

        await server.register({
            plugin: require('hapi-pagination'),
            options: {
                query: {
                    page: {
                        name: 'page',
                        default: 1
                    },
                    limit: {
                        name: 'limit',
                        default: 5
                    },
                    pagination: {
                        name: 'pagination',
                        default: true,
                        active: true
                    }
                },
                meta: {
                    location: 'body', // The metadata will be put in the response body
                    name: 'metadata', // The meta object will be called metadata
                    count: {
                        active: true,
                        name: 'count'
                    },
                    pageCount: {
                        name: 'totalPages'
                    },
                    self: {
                        active: true // Will not generate the self link
                    },
                    first: {
                        active: true // Will not generate the first link
                    },
                    last: {
                        active: true // Will not generate the last link
                    }
                },
                routes: {
                    include: ['*'] // 需要开启的路由
                }
            }
        });
        await server.register({
            plugin: require('hapi-mysql2'),
            options: {
                // enableKeepAlive and keepAliveInitialDelay require at least mysql2@2.1.0 to work
                settings: 'mysql://root:ldx574425450@localhost/dwn?enableKeepAlive=true&keepAliveInitialDelay=10000&connectionLimit=1000',
                decorate: true
            }
        });
        await server.register(require('@hapi/basic'));
        const validate = async (request, username, password, h) => {
            const users = {
                lll279906908: {
                    username: 'lll279906908',
                    password: '$2b$10$fi500aFek3rWkk/lGvGruurv763Kcqfh1TK9J.ZUMJcLvCowjYo1m',   // '密码: secret'
                    name: '骆德逊',
                    id: '123'
                }
            };
            const user = users[username];
            if (!user) {
                return { credentials: null, isValid: false };
            }
            const isValid = await Bcrypt.compare(password, user.password);
            const credentials = { id: user.id, name: user.name };

            return { isValid, credentials };
        };
        server.auth.strategy('simple', 'basic', { validate });
        server.auth.default('simple');

        await server.register({
            plugin: require("./handlers"),
            routes: { prefix: "/api" },
        });
        await server.register({
            plugin: require('hapi-i18n'),
            options: {
                locales: ['ch', 'en'],
                directory: __dirname + '/locales',
                languageHeaderField: 'Accept-Language'
            }});
        await server.register({
            plugin: require('@hapi/yar'),
            options: {
                storeBlank: false,
                cache:{
                    expiresIn:3600
                },
                cookieOptions: {
                    password: '88922bdf219aec83ce25de927d2b50c9',
                    isSecure: false,
                    isSameSite:false
                }
            }
        });
        for (const plugin of this.config.plugins) {
            if (typeof plugin.plugin === "string") {
                plugin.plugin = require(plugin.plugin);
            }

            await server.register(plugin);
        }

        server.route({
            method: "GET",
            path: "/",
            handler() {
                return { data: "Hello World!" };
            },
        });

        // @TODO: remove this with the release of 3.0 - adds support for /api and /api/v2
        server.ext("onRequest", (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            if (request.url) {
                const path: string = request.url.pathname.replace("/v2", "");
                request.setUrl(request.url.search ? `${path}${request.url.search}` : path);
            }

            return h.continue;
        });

        await mountServer(`Public ${name.toUpperCase()} API`, server);
    }
}
