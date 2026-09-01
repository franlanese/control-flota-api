const { sql, poolPromise } = require('../../../db');

// Réplica de ReportesController@reportesTelefonistas — SP preexistente Rep_ReporteTelefonistas.
// OJO: este SP no existe en la base "Demo" contra la que apunta este API en desarrollo (se
// verificó con sys.objects) — puede que sí exista en la base de producción real. Si al probar
// esto tira "objeto no válido"/"procedimiento no encontrado", es por esto, no por un bug acá.
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const { telefonista, desde, hasta } = body;

        if (!desde || !hasta) {
            return res.status(400).json({ success: false, error: 'Debe indicar desde y hasta' });
        }

        const fechaDesde = new Date(desde);
        fechaDesde.setHours(0, 0, 0, 0);
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999);

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Telefonista', sql.VarChar(50), telefonista || null)
            .input('FechaDesde', sql.DateTime, fechaDesde)
            .input('FechaHasta', sql.DateTime, fechaHasta)
            .execute('dbo.Rep_ReporteTelefonistas');

        // Réplica del formateo de fechas del controller (dd/mm/yyyy HH:mm) — se hace en el
        // front al renderizar, no hace falta reformatear cada campo del recordset acá.
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error en reportes/reporteTelefonistas: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al generar el reporte (¿existe Rep_ReporteTelefonistas en esta base?)' });
    }
};
