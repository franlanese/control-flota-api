const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .execute('dbo.Rep_semaforos');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en getSemaforos: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al procesar el reporte de semáforos'
        });
    }
};
