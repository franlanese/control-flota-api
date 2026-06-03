const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};

        // Mapeamos el permiso enviado (ej: true/false o 1/0) a tipo entero
        const hasPermisoWebSalud = body.hasPermisoWebSalud === true || body.hasPermisoWebSalud === 'true' || parseInt(body.hasPermisoWebSalud, 10) === 1 ? 1 : 0;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('HasPermisoWebSalud', sql.Int, hasPermisoWebSalud)
            .execute('dbo.CFR_GetAgendados');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en getAgendados: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener los viajes agendados'
        });
    }
};
