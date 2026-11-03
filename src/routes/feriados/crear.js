const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// La fecha viaja como 'YYYY-MM-DD' (lo que emite <input type="date"> y lo que
// devuelve CFR_Feriados_Lista); el SP rechaza duplicados.
// Se manda como VarChar y NO como sql.Date: db.js usa useUTC: false, y mssql toma
// 'YYYY-MM-DD' como medianoche UTC y la escribe en hora local (UTC-3), así que llegaba
// al SP con un día menos. Como texto ISO, SQL Server la convierte al parámetro DATE
// del SP sin depender de la zona horaria ni del DATEFORMAT.
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

module.exports = async (req, res) => {
    try {
        const { fecha, descripcion } = req.body;

        if (!fecha || !FECHA_RE.test(fecha)) {
            return res.status(400).json({ success: false, error: 'La fecha es obligatoria (formato YYYY-MM-DD)' });
        }
        if (!descripcion || !descripcion.trim()) {
            return res.status(400).json({ success: false, error: 'La descripción es obligatoria' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('fecha', sql.VarChar(10), fecha)
            .input('descripcion', sql.VarChar(50), descripcion.trim())
            .execute('CFR_Feriados_Crear');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Feriados_Crear:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
