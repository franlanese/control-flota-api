const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SET NOCOUNT ON; EXEC CFR_Moviles_Lista');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Moviles_Lista:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
