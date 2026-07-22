const { sql, poolPromise } = require('../../../db');

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
            .input('Nro_Movil', sql.Int, nroMovil)
            .input('NroOperador', sql.Int, nroOperador)
            .execute('dbo.MF_SuspenderMovil');

        res.json({
            success: true,
            message: 'Móvil suspendido con éxito'
        });
    } catch (err) {
        console.error('Error en suspenderMovil: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al suspender el móvil'
        });
    }
};
