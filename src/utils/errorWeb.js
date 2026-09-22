const { poolPromise, sql } = require('../../db');

// Registro de errores en EVENTOS_ERRORWEB vía el SP NU_InsertarErrorWeb, replicando lo que hace
// app/Exceptions/Handler.php en Laravel:
//   - Sólo se registran errores de BASE DE DATOS (allá: `$e instanceof QueryException`).
//   - El mensaje se arma como "CODIGO | mensaje en una línea | METODO url", cortado a 1200.
//   - Se manda el id del usuario logueado (o NULL) y la versión de la app.
//   - Dos protecciones: no reentrar mientras se está registrando (si el propio INSERT falla,
//     no se intenta registrar ese fallo) y un enfriamiento de 30 s tras un fallo, para no
//     reintentar contra una base caída en cada request.

const SEGUNDOS_ENFRIAMIENTO = 30;
const LARGO_MAXIMO = 1200;
// Misma cadena que manda el login al actualizar NuUsuarios.version. En la tabla la columna
// Version es varchar(20): si se cambia, que entre en ese largo.
const VERSION_APP = process.env.APP_VERSION || 'v3.0.0-node';

// Errores del driver mssql: sus clases son RequestError / ConnectionError / TransactionError /
// PreparedStatementError, y cuando el error viene del motor trae `number` (el error number de
// SQL Server, ej. 208 = "Invalid object name"). Ese par es el equivalente más cercano al
// QueryException de Laravel.
const CLASES_MSSQL = new Set(['RequestError', 'ConnectionError', 'TransactionError', 'PreparedStatementError']);

let registrando = false;      // evita la recursión (loggingToSp en Laravel)
let ultimoFallo = null;       // epoch ms del último fallo (spLastFailureTime en Laravel)

function esErrorDeBase(err) {
    if (!err) return false;
    return typeof err.number === 'number' || CLASES_MSSQL.has(err.name);
}

// "SQLSTATE 42S02 | mensaje | POST http://host/api/x" — mismas partes y orden que Laravel.
function armarMensaje(err, req) {
    const partes = [];

    // Laravel usa el SQLSTATE de PDO; el driver de Node no lo expone, pero sí el número de error
    // de SQL Server, que identifica el problema igual de bien.
    if (typeof err.number === 'number') partes.push(`SQL ${err.number}`);
    else if (err.code) partes.push(`CODE ${err.code}`);

    partes.push(String(err.message || '').replace(/\s+/g, ' ').trim());

    if (req) {
        const host = req.get ? req.get('host') : '';
        partes.push(`${req.method} ${req.protocol}://${host}${req.originalUrl}`);
    }

    return partes.join(' | ').slice(0, LARGO_MAXIMO);
}

// Devuelve true si el error quedó registrado. Nunca lanza: si algo falla, sólo lo deja en consola.
async function registrarErrorWeb(err, req) {
    if (!esErrorDeBase(err) || registrando) return false;

    const enEnfriamiento = ultimoFallo !== null && Date.now() - ultimoFallo < SEGUNDOS_ENFRIAMIENTO * 1000;
    if (enEnfriamiento) return false;

    registrando = true;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('IdUsuario', sql.Int, (req && req.user && req.user.userId) || null)
            .input('Error', sql.VarChar(sql.MAX), armarMensaje(err, req))
            .input('Version', sql.VarChar(20), VERSION_APP)
            .execute('NU_InsertarErrorWeb');
        ultimoFallo = null;   // la base respondió: se levanta el enfriamiento
        return true;
    } catch (fallo) {
        ultimoFallo = Date.now();
        console.error('[NU_InsertarErrorWeb] no se pudo registrar el error:', fallo.message);
        return false;
    } finally {
        registrando = false;
    }
}

module.exports = { registrarErrorWeb, esErrorDeBase, armarMensaje };
