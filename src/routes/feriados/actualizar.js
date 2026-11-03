const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// La fecha original (la que identifica la fila) viaja en la URL; la nueva, en el body.
// Ambas se mandan como VarChar y no como sql.Date: ver el comentario en crear.js.
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

module.exports = async (req, res) => {
    try {
        const fechaOriginal = req.params.fecha;
        const { fecha, descripcion } = req.body;

        if (!fechaOriginal || !FECHA_RE.test(fechaOriginal)) {
            return res.status(400).json({ success: false, error: 'Fecha original inválida (formato YYYY-MM-DD)' });
        }
        if (!fecha || !FECHA_RE.test(fecha)) {
            return res.status(400).json({ success: false, error: 'La fecha es obligatoria (formato YYYY-MM-DD)' });
        }
        if (!descripcion || !descripcion.trim()) {
            return res.status(400).json({ success: false, error: 'La descripción es obligatoria' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('fecha_original', sql.VarChar(10), fechaOriginal)
            .input('fecha', sql.VarChar(10), fecha)
            .input('descripcion', sql.VarChar(50), descripcion.trim())
            .execute('CFR_Feriados_Actualizar');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Feriados_Actualizar:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
