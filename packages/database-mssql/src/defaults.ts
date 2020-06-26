export const defaults = {
    server: process.env.CORE_DB_SERVER || "106.55.62.27",
    port: process.env.CORE_DB_PORT || 1433,
    database: process.env.CORE_DB_DATABASE || `csart`,
    user: process.env.CORE_DB_USERNAME || "sa",
    password: process.env.CORE_DB_PASSWORD || "sqlpp2020N",
};
