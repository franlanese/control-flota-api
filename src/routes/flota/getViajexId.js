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

        const pool = await poolPromise;
        const result = await pool.request()
            .input('NroViaje', sql.Int, nroViaje)
            .execute('dbo.CFR_GetViajexId');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getViajexId: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener la información del viaje'
        });
    }
};
