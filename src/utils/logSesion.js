const { sql } = require('../../db');
const { ipCliente } = require('./ipCliente');
const { parsearUserAgent } = require('./userAgent');

// Corta un texto al largo de la columna y convierte vacíos en NULL. Estos datos vienen de
// headers y del body, que manda el cliente: si llega algo más largo que la columna, el SP
// fallaría y el evento no quedaría registrado.
const texto = (valor, max) => {
    // Sólo texto o número: si el cliente manda un objeto o un array, se descarta.
    if (typeof valor !== 'string' && typeof valor !== 'number') return null;
    const s = String(valor).trim();
    return s ? s.slice(0, max) : null;
};

// Registra un LOGIN o LOGOUT en CFR_LogsUsuario vía CFR_LogsUsuario_Registrar. Lo usan login.js y
// logout.js para no repetir la lista de parámetros.
//
// Los datos del usuario (usuario, nombre, nivel, flota, descripción del puesto) NO se
// mandan desde acá: los completa el SP a partir de nroOperador y nroPuesto.
//
//   evento      'LOGIN' | 'LOGOUT'
//   nroOperador NuUsuarios.user_id
//   nroPuesto / nroMesas   los de ESTA sesión (del body en el login, del JWT en el logout)
//   cliente     { pantalla, zonaHoraria } — sólo lo puede informar el front; opcional
//   detalle     texto libre (ej. el aviso de vencimiento de licencia)
async function registrarSesion(pool, req, { evento, nroOperador, nroPuesto, nroMesas, zonaHoraria, versionApp, detalle }) {
    const userAgent = req.get('user-agent');
    const { navegador, sistemaOp, dispositivo } = parsearUserAgent(userAgent);

    await pool.request()
        .input('NroOperador', sql.SmallInt, nroOperador)
        .input('Evento', sql.VarChar(20), evento)
        .input('IP', sql.VarChar(200), ipCliente(req))
        .input('NroPuesto', sql.SmallInt, Number.isInteger(nroPuesto) ? nroPuesto : null)
        .input('NroMesas', sql.VarChar(20), texto(nroMesas, 20))
        .input('Navegador', sql.VarChar(50), navegador)
        .input('SistemaOp', sql.VarChar(50), sistemaOp)
        .input('Dispositivo', sql.VarChar(20), dispositivo)
        .input('UserAgent', sql.VarChar(500), texto(userAgent, 500))
        .input('Idioma', sql.VarChar(100), texto(req.get('accept-language'), 100))
        .input('Origen', sql.VarChar(200), texto(req.get('origin'), 200))
        .input('ZonaHoraria', sql.VarChar(60), texto(zonaHoraria, 60))
        .input('VersionApp', sql.VarChar(20), texto(versionApp, 20))
        .input('Detalle', sql.VarChar(250), texto(detalle, 250))
        .execute('CFR_LogsUsuario_Registrar');
}

module.exports = { registrarSesion };
