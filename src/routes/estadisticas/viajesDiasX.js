const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de EstadisticasController@getViajesDiasX — llama al SP preexistente NU_ViajesDiasX
// (no se toca). @Tipo: 0=rango de fechas, 1=por móvil, 2=por zona (mismo criterio que
// viajestotales_opciones en estadisticas/scripts.js). @Tiempo: 0=cantidad por día, 1=promedio por hora.
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const { desde, hasta, tipo, id, tiempo } = body;

        if (!desde || !hasta) {
            return res.status(400).json({ success: false, error: 'Debe indicar desde y hasta' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Tipo', sql.Int, tipo !== undefined ? parseInt(tipo, 10) : 0)
            .input('Id', sql.Int, id !== undefined && id !== null && id !== '' ? parseInt(id, 10) : 0)
            .input('Desde', sql.DateTime, new Date(desde))
            .input('Hasta', sql.DateTime, new Date(hasta))
            .input('Tiempo', sql.Int, tiempo !== undefined ? parseInt(tiempo, 10) : 0)
            .execute('dbo.NU_ViajesDiasX');

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en estadisticas/viajesDiasX: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al generar la estadística' });
    }
};
