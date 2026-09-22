const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de MensajeriaController@marcarLeido — SP preexistente MensajeUsuario_MarcarLeido.
module.exports = async (req, res) => {
    try {
        const idMensajeUsuario = parseInt((req.body || {}).idMensajeUsuario, 10);
        if (!idMensajeUsuario) {
            return res.status(400).json({ success: false, error: 'El parámetro idMensajeUsuario es requerido' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('IdMensajeUsuario', sql.Int, idMensajeUsuario)
            .execute('dbo.MensajeUsuario_MarcarLeido');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en mensajeria/marcarLeido: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al marcar el mensaje como leído' });
    }
};
