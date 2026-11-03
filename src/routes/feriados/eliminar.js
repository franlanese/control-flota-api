const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// La fecha se manda como VarChar y no como sql.Date: ver el comentario en crear.js.
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

module.exports = async (req, res) => {
    try {
        const fecha = req.params.fecha;

        if (!fecha || !FECHA_RE.test(fecha)) {
            return res.status(400).json({ success: false, error: 'Fecha inválida (formato YYYY-MM-DD)' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('fecha', sql.VarChar(10), fecha)
            .execute('CFR_Feriados_Eliminar');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Feriados_Eliminar:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
