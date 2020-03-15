export const defaults = {
    host: process.env.CORE_DB_HOST || "localhost",
    port: process.env.CORE_DB_PORT || 3306,
    database: process.env.CORE_DB_DATABASE || `dwn`,
    user: process.env.CORE_DB_USERNAME || "root",
    password: process.env.CORE_DB_PASSWORD || "ldx574425450",
};
