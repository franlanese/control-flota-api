const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroViaje = body.nro_viaje;

        if (nroViaje === undefined || nroViaje === null) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro nro_viaje es requerido'
            });
        }

        // Réplica de HistoricoController@getRecorridosEnFlota (Laravel) — "Ver Recorrido" en un
        // viaje en realidad no usa el SP Viaje_Recorrido (ese no está conectado a este botón,
        // devuelve vacío para viajes activos): consulta MOVILES_POSICIONES por el móvil asignado
        // desde el inicio del viaje. Ver CFR_GetRecorridoViaje (nuevo, resuelve movil/inicio
        // internamente a partir de @NroViaje para no cambiar el contrato de este endpoint).
        const pool = await poolPromise;
        const result = await pool.request()
            .input('NroViaje', sql.Int, nroViaje)
            .execute('dbo.CFR_GetRecorridoViaje');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getPosicionesViajexId: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener el recorrido del viaje'
        });
    }
};
