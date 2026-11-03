const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { registrarSesion } = require('../../utils/logSesion');

// Registra el cierre de sesión en CFR_LogsUsuario (Evento = 'LOGOUT').
//
// El JWT no se invalida acá: no hay lista de tokens revocados, la sesión se "cierra" cuando
// el front borra el token de localStorage. Este endpoint es sólo auditoría.
//
// Sólo queda registro cuando el usuario toca "Salir". Si cierra la pestaña o el token vence
// a las 12 h no hay ningún pedido al servidor, así que va a haber LOGIN sin su LOGOUT.
module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        // Puesto y mesas salen del token, que son los de ESTA sesión. NuUsuarios guarda sólo
        // los del último login, y podría ser otro si el usuario entró después desde otra PC.
        await registrarSesion(pool, req, {
            evento: 'LOGOUT',
            nroOperador: req.user.userId,
            nroPuesto: req.user.nro_puesto,
            nroMesas: req.user.nro_mesas,
        });

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en logout: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al registrar el cierre de sesión' });
    }
};
