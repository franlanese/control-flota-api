const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('CFR_PDC_MovilesPorCanal');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en movilesPorCanal:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
