const { poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SET NOCOUNT ON; SET DATEFORMAT dmy; EXEC Rep_Lineas');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error en lineas:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
