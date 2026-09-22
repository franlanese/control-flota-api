const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const user = req.user || {};
        const nroMovil = body.nro_movil;
        const nroOperador = user.userId !== undefined ? parseInt(user.userId, 10) : 1; // Fallback a 1 si no se provee

        if (nroMovil === undefined || nroMovil === null) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro nro_movil es requerido'
            });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('Nro_Movil', sql.Int, nroMovil)
            .input('NroOperador', sql.Int, nroOperador)
            .execute('dbo.MF_PonerPrimeroEnBase');

        res.json({
            success: true,
            message: 'Móvil posicionado primero en base con éxito'
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en ponerPrimero: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al poner primero al móvil'
        });
    }
};
