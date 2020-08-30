export const defaults = {
    host: process.env.CORE_DB_HOST || "129.204.249.237",
    port: process.env.CORE_DB_PORT || 3306,
    database: process.env.CORE_DB_DATABASE || `csgy`,
    user: process.env.CORE_DB_USERNAME || "root",
    password: process.env.CORE_DB_PASSWORD || "sqlapp2020xx",
};
