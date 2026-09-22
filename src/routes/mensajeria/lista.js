const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de MensajeriaController@getMensajesMensajeria (Laravel, raw SQL) — últimos 30 mensajes
// donde el usuario logueado es emisor o destinatario. Ver CFR_Mensajeria_Lista (nuevo).
module.exports = async (req, res) => {
    try {
        const idUsuario = req.user && req.user.userId;
        if (idUsuario === undefined || idUsuario === null) {
            return res.status(400).json({ success: false, error: 'No se pudo determinar el usuario logueado' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('IdUsuario', sql.Int, idUsuario)
            .execute('dbo.CFR_Mensajeria_Lista');

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en mensajeria/lista: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener los mensajes' });
    }
};
