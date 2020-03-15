module.exports = {
    "@luodexun/logger-pino": {},
    // "@luodexun/database-postgres":{
    //   connection: {
    //     host: process.env.CORE_DB_HOST || "localhost",
    //     port: process.env.CORE_DB_PORT || 5432,
    //     database: process.env.CORE_DB_DATABASE || "dev",
    //     user: process.env.CORE_DB_USERNAME || "postgres",
    //     password: process.env.CORE_DB_PASSWORD || "123456",
    //   },
    // },
  "@luodexun/database-mysql":{
    host: process.env.CORE_MYSQL_HOST || "localhost",
    port: process.env.CORE_MYSQL_PORT || 3306,
    database: process.env.CORE_DB_DATABASE || "dwn",
    user: process.env.CORE_DB_USERNAME || "root",
    password: process.env.CORE_DB_PASSWORD || "ldx574425450",
  },
    "@luodexun/wallet-api":{}
};
