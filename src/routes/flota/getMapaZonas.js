const { poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SET NOCOUNT ON; EXEC dbo.CFR_Mapa_Zonas');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error en CFR_Mapa_Zonas:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
