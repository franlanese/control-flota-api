const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de EstadisticasController@getViajesPorOperador — SP preexistente NU_ViajesPorOperador.
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const { desde, hasta } = body;

        if (!desde || !hasta) {
            return res.status(400).json({ success: false, error: 'Debe indicar desde y hasta' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Desde', sql.DateTime, new Date(desde))
            .input('Hasta', sql.DateTime, new Date(hasta))
            .execute('dbo.NU_ViajesPorOperador');

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en estadisticas/viajesPorOperador: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al generar la estadística' });
    }
};
