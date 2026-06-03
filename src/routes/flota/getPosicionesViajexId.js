const { sql, poolPromise } = require('../../../db');

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
            .execute('dbo.Viaje_Recorrido');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en getPosicionesViajexId: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener el recorrido del viaje'
        });
    }
};
