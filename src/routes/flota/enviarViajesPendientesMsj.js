const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const user = req.user || {};
        const nroOperador = user.userId !== undefined ? parseInt(user.userId, 10) : 1;

        const pool = await poolPromise;
        await pool.request()
            .input('NroOperador', sql.Int, nroOperador)
            .execute('dbo.NU_MensajeTecla');

        res.json({
            success: true,
            message: 'Mensajes de viajes pendientes enviados correctamente'
        });
    } catch (err) {
        console.error('Error en enviarViajesPendientesMsj: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al enviar mensajes de viajes pendientes'
        });
    }
};
