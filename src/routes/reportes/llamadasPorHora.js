const { sql, poolPromise } = require('../../../db');

// Réplica de ReportesController@llamadasPorHora — SP preexistente Rep_LlamadasxHora.
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const { desde, hasta } = body;

        if (!desde || !hasta) {
            return res.status(400).json({ success: false, error: 'Debe indicar desde y hasta' });
        }

        // Réplica de startOfDay()/endOfDay() en el controller original.
        const fechaDesde = new Date(desde);
        fechaDesde.setHours(0, 0, 0, 0);
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999);

        const pool = await poolPromise;
        const result = await pool.request()
            .input('FechaDesde', sql.DateTime, fechaDesde)
            .input('FechaHasta', sql.DateTime, fechaHasta)
            .execute('dbo.Rep_LlamadasxHora');

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error en reportes/llamadasPorHora: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al generar el reporte' });
    }
};
