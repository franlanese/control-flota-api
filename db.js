require('dotenv').config();
const sql = require('mssql')

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 15000,
        useUTC: false,
    }
}

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Conectado exitosamente!');
        return pool
    })
    .catch(err => {
        console.error('Error de conexion a la BD: ', err)
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise
}