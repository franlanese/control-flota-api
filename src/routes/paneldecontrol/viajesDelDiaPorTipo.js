const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SET NOCOUNT ON; SET DATEFORMAT dmy; EXEC Rep_ViajesDelDiaxTipo');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en viajesDelDiaPorTipo:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
