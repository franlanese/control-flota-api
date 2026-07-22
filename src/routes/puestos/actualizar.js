const { poolPromise, sql } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const idPuesto = parseInt(req.params.id_puesto);
        const { descripcion, telefono } = req.body;

        if (!descripcion || !descripcion.trim()) {
            return res.status(400).json({ success: false, error: 'La descripción es obligatoria' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('id_puesto', sql.Int, idPuesto)
            .input('descripcion', sql.VarChar(100), descripcion.trim())
            .input('telefono', sql.VarChar(20), telefono || '')
            .execute('CFR_Puestos_Update');

        res.json({ success: true });
    } catch (err) {
        console.error('Error en CFR_Puestos_Update:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
