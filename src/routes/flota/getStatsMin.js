const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const list = body.list !== undefined ? body.list : ''; // El filtro de mesas separadas por comas

        const pool = await poolPromise;
        const result = await pool.request()
            .input('List', sql.VarChar(sql.MAX), list)
            .execute('dbo.NU_ViajesDelDia');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en getStatsMin: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al procesar las estadísticas de viajes del día'
        });
    }
};
