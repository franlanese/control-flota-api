const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroViaje = body.nro_viaje;
        const accion = body.accion;
        const user = req.user || {};
        const usuario = user.userId !== undefined ? parseInt(user.userId, 10) : 1; // Fallback a 1 si no se provee

        if (nroViaje === undefined || nroViaje === null || !accion) {
            return res.status(400).json({
                success: false,
                error: 'Los parámetros nro_viaje y accion son requeridos'
            });
        }

        let cleanAccion = String(accion).trim();
        if (cleanAccion === 'anular') {
            cleanAccion = 'anul';
        } else if (cleanAccion === 'finalizar') {
            cleanAccion = 'fina';
        } else {
            cleanAccion = cleanAccion.substring(0, 5);
        }

        const pool = await poolPromise;
        await pool.request()
            .input('IdViaje', sql.Int, nroViaje)
            .input('Accion', sql.VarChar(5), cleanAccion)
            .input('Usuario', sql.SmallInt, usuario)
            .execute('dbo.CFR_Eventos_acciones');

        res.json({
            success: true,
            message: 'Acción de evento ejecutada con éxito'
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en accionesEventos: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al procesar la acción del evento'
        });
    }
};
