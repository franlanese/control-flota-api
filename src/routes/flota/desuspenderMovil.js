const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroMovil = body.nro_movil;
        const user = req.user || {};
        const nroOperador = user.userId !== undefined ? parseInt(user.userId, 10) : 1;

        if (nroMovil === undefined || nroMovil === null) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro nro_movil es requerido'
            });
        }

        const pool = await poolPromise;
        await pool.request()
            // Obs: El SP en MSSQL usa @nro_movil con la 'n' inicial en minúscula
            .input('nro_movil', sql.Int, nroMovil)
            .input('NroOperador', sql.Int, nroOperador)
            .execute('dbo.CFR_MF_DesuspenderMovil');

        res.json({
            success: true,
            message: 'Suspensión del móvil levantada con éxito'
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en desuspenderMovil: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al levantar la suspensión del móvil'
        });
    }
};
