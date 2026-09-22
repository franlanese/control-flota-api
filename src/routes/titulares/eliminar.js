const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const nroTitular = parseInt(req.params.nro_titular);
        const pool = await poolPromise;
        await pool.request()
            .input('nro_titular', sql.Int, nroTitular)
            .execute('CFR_Titulares_Delete');
        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Titulares_Delete:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
