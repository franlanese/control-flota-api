const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const queryParams = req.query.id_viaje !== undefined ? req.query : req.body;
        const id_viaje = queryParams.id_viaje;
        if (!id_viaje) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro id_viaje es requerido'
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('idViaje', sql.Int, parseInt(id_viaje, 10))
            .execute('dbo.NU_CLIENTE_ObtenerxViaje');
        
        res.json(result.recordset);
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en checkTelReclamo: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno al consultar el reclamo del viaje'
        });
    }
};
