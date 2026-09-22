const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de MensajeriaController@mensajeriaEnviar — SPs preexistentes MensajeUsuario_Grabar
// (destinatario individual) / MensajeUsuario_GrabarGrupo (mensaje a un grupo), sin tocar.
// El front llama este endpoint una vez por destinatario cuando grupo === "sin" (mismo criterio
// que mensajeria/scripts.js: un EXEC MensajeUsuario_Grabar por cada destinatario elegido).
module.exports = async (req, res) => {
    try {
        const b = req.body || {};
        const idEmisor = req.user && req.user.userId;
        const grupo = b.grupo !== undefined && b.grupo !== null ? String(b.grupo) : 'sin';
        const asunto = String(b.asunto || '');
        const mensaje = String(b.mensaje || '');

        if (!mensaje || !asunto) {
            return res.status(400).json({ success: false, error: 'Asunto y mensaje son requeridos' });
        }

        const pool = await poolPromise;

        if (grupo === 'sin') {
            const destinatario = parseInt(b.destinatario, 10);
            if (!destinatario) {
                return res.status(400).json({ success: false, error: 'El parámetro destinatario es requerido' });
            }
            await pool.request()
                .input('IdUsuarioEmisor', sql.Int, idEmisor)
                .input('IdUsuarioDestinatario', sql.Int, destinatario)
                .input('Asunto', sql.VarChar(100), asunto)
                .input('Mensaje', sql.VarChar(1000), mensaje)
                .execute('dbo.MensajeUsuario_Grabar');
        } else {
            await pool.request()
                .input('IdUsuarioEmisor', sql.Int, idEmisor)
                .input('Asunto', sql.VarChar(100), asunto)
                .input('Mensaje', sql.VarChar(1000), mensaje)
                .input('Grupo', sql.VarChar(50), grupo)
                .execute('dbo.MensajeUsuario_GrabarGrupo');
        }

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en mensajeria/enviar: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al enviar el mensaje' });
    }
};
