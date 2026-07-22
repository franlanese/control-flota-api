const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const user = req.user || {};
        
        // Formatear mesas concatenadas por comas (ej: "15" -> "1,5")
        let list = '';
        if (user.nro_mesas && user.nro_mesas !== '0') {
            list = String(user.nro_mesas).split('').join(',');
        }

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
