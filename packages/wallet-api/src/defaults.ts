export const defaults = {
    enabled: !process.env.CORE_API_DISABLED,
    host: process.env.CORE_API_HOST || "0.0.0.0",
    port: process.env.CORE_API_PORT || 4003,
    // @see https://hapijs.com/api#-serveroptionstls
    ssl: {
        enabled: process.env.CORE_API_SSL,
        host: process.env.CORE_API_SSL_HOST || "0.0.0.0",
        port: process.env.CORE_API_SSL_PORT || 8443,
        key: process.env.CORE_API_SSL_KEY,
        cert: process.env.CORE_API_SSL_CERT,
    },
    // @see https://github.com/wraithgar/hapi-rate-limit
    rateLimit: {
        enabled: !process.env.CORE_API_RATE_LIMIT,
        pathLimit: false,
        userLimit: process.env.CORE_API_RATE_LIMIT_USER_LIMIT || 300,
        userCache: {
            expiresIn: process.env.CORE_API_RATE_LIMIT_USER_EXPIRES || 60000,
        },
    },
    pagination: {
        limit: 100,
    },
    whitelist: ["*"],
    plugins: [],
};
