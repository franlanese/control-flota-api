const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { registrarSesion } = require('../../utils/logSesion');

// Registra en CFR_LogsUsuario que la página se recargó o se cerró (Evento = 'RECARGA/CIERRE').
//
// Lo dispara el front con navigator.sendBeacon en el evento 'pagehide' (ver AppLayout.tsx).
// El navegador no informa si fue una recarga, el cierre de la pestaña o del navegador, o la
// navegación a otra dirección: por eso es un solo evento.
//
// Es "mejor esfuerzo": si el navegador se cuelga, se corta la luz o se cae la red, no llega.
// Nadie lee la respuesta (la página ya se fue), pero se mantiene el formato de siempre.
module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        await registrarSesion(pool, req, {
            evento: 'RECARGA/CIERRE',
            nroOperador: req.user.userId,
            nroPuesto: req.user.nro_puesto,
            nroMesas: req.user.nro_mesas,
        });

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en recarga-cierre: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al registrar la recarga/cierre' });
    }
};
