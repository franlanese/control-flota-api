const { poolPromise, sql } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const idPuesto = parseInt(req.params.id_puesto);
        const pool = await poolPromise;
        await pool.request()
            .input('id_puesto', sql.Int, idPuesto)
            .execute('CFR_Puestos_Delete');
        res.json({ success: true });
    } catch (err) {
        console.error('Error en CFR_Puestos_Delete:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
