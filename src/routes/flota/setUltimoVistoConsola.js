const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};

        const user = req.user || {};

        // Identificador del usuario logueado activo
        const userId = user.userId !== undefined ? parseInt(user.userId, 10) : 1; 

        const pool = await poolPromise;
        await pool.request()
            .input('UserId', sql.Int, userId)
            .execute('dbo.CFR_SetUltimoVistoConsola');

        res.json({
            success: true,
            message: 'Último visto en consola actualizado correctamente'
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en setUltimoVistoConsola: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al actualizar el último visto en consola'
        });
    }
};
