const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};

        // Parámetros de contexto
        const userId = body.userId !== undefined ? parseInt(body.userId, 10) : 1; // Fallback a usuario ID 1
        const filtroMesas = body.filtroMesas || '';

        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserId', sql.Int, userId)
            .input('FiltroMesas', sql.VarChar(sql.MAX), filtroMesas)
            .execute('dbo.CFR_GetConsola');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en getConsola: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener los mensajes de consola'
        });
    }
};
