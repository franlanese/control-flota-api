const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};

        // Identificador del usuario logueado activo
        const userId = body.userId !== undefined ? parseInt(body.userId, 10) : 1; // Fallback a usuario ID 1

        const pool = await poolPromise;
        await pool.request()
            .input('UserId', sql.Int, userId)
            .execute('dbo.CFR_SetUltimoVistoConsola');

        res.json({
            success: true,
            message: 'Último visto en consola actualizado correctamente'
        });
    } catch (err) {
        console.error('Error en setUltimoVistoConsola: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al actualizar el último visto en consola'
        });
    }
};
