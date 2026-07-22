const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const user = req.user || {};

        // Mapeamos el permiso de la sesión de JWT (WebSalud)
        const hasPermisoWebSalud = user.permisos && user.permisos.includes('WebSalud') ? 1 : 0;

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
