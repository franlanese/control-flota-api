const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de AccionesController@cancelarViaje (Laravel): usa el SP real de negocio, que exige
// un código de motivo de cancelación.
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroViaje = body.nro_viaje;
        const motivo = body.motivo;
        const user = req.user || {};
        const usuario = user.userId !== undefined ? parseInt(user.userId, 10) : 1;

        if (nroViaje === undefined || nroViaje === null || motivo === undefined || motivo === null || motivo === '') {
            return res.status(400).json({
                success: false,
                error: 'Los parámetros nro_viaje y motivo son requeridos'
            });
        }

        const pool = await poolPromise;

        // Regla nueva (no existía en Laravel; MF_CancelarViaje no mira el estado): un viaje
        // iniciado no se anula. Se valida acá además de en el menú del panel, porque la pantalla
        // puede estar desactualizada. Ver docs/decisions/0015-anular-iniciado-y-busqueda-telefonista.md.
        const estado = await pool.request()
            .input('nro_viaje', sql.Int, parseInt(nroViaje, 10))
            .execute('dbo.CFR_Viajes_Estado');
        const viaje = estado.recordset[0];
        if (!viaje) {
            return res.status(409).json({ success: false, error: 'El viaje ya no está activo' });
        }
        if (viaje.estado_respecto_cliente === 'I') {
            return res.status(409).json({ success: false, error: 'No se puede anular un viaje iniciado' });
        }

        await pool.request()
            .input('Nro_Viaje', sql.Int, parseInt(nroViaje, 10))
            .input('Cod_motivo_cancelacion', sql.Int, parseInt(motivo, 10))
            .input('NroOperador', sql.Int, usuario)
            .execute('dbo.MF_CancelarViaje');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en MF_CancelarViaje: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al anular el viaje'
        });
    }
};
