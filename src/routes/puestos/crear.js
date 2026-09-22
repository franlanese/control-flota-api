const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const { descripcion, telefono } = req.body;

        if (!descripcion || !descripcion.trim()) {
            return res.status(400).json({ success: false, error: 'La descripción es obligatoria' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('descripcion', sql.VarChar(100), descripcion.trim())
            .input('telefono', sql.VarChar(20), telefono || '')
            .execute('CFR_Puestos_Crear');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Puestos_Crear:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
