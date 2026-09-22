const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de MensajeriaController@mensajesSinLeer — SP preexistente MensajeUsuario_MensajesSinLeer.
module.exports = async (req, res) => {
    try {
        const idUsuario = req.user && req.user.userId;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('IdUsuario', sql.Int, idUsuario)
            .execute('dbo.MensajeUsuario_MensajesSinLeer');

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en mensajeria/sinLeer: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al comprobar mensajes sin leer' });
    }
};
