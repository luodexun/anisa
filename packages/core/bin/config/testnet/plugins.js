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
  "@luodexun/event-emitter": {},
  "@luodexun/database-mysql":{
    host:"129.204.249.237",
    port:3306,
    database:"csgy",
    user: "root",
    password:"sqlapp2020xx",
  },
  "@luodexun/database-mssql":{
    server:"106.55.62.27",
    port:1433,
    database: `csart`,
    user:  "sa",
    password:"sqlpp2020N",
  },
  "@luodexun/p2p":{},
  "@luodexun/wallet-api":{}
};
