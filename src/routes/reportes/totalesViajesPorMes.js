const { sql, poolPromise } = require('../../../db');

// Réplica de ReportesController@totalesviajespormes — SP preexistente Rep_xTipoViaje. Laravel
// arma "01-mm/yyyy" y "un mes después" con SQL crudo (DATEADD); acá se calculan las dos fechas
// en Node con el mismo criterio (primer día del mes elegido → primer día del mes siguiente) y
// se pasan como DATETIME tipados, sin concatenar strings en la query.
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const mes = body.mes; // 'YYYY-MM' (input type="month" de React)

        if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
            return res.status(400).json({ success: false, error: 'Debe indicar un mes válido (YYYY-MM)' });
        }

        const [anio, mesNum] = mes.split('-').map(n => parseInt(n, 10));
        const desde = new Date(anio, mesNum - 1, 1);
        const hasta = new Date(anio, mesNum, 1); // primer día del mes siguiente

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Desde', sql.DateTime, desde)
            .input('Hasta', sql.DateTime, hasta)
            .execute('dbo.Rep_xTipoViaje');

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error en reportes/totalesViajesPorMes: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al generar el reporte' });
    }
};
