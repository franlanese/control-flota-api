const { poolPromise, sql } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const userId = parseInt(req.params.user_id);
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.Int, userId)
            .execute('CFR_Usuarios_Delete');
        res.json({ success: true });
    } catch (err) {
        console.error('Error en CFR_Usuarios_Delete:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
