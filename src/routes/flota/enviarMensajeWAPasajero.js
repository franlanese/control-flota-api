const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de AccionesController@enviarMensajeWAPasajero (Laravel): manda un mensaje de texto
// libre directo al WhatsApp del pasajero (no al móvil). El SP original de Laravel,
// NU_MensajeOperWA, no existe en esta base — este endpoint llama a CFR_EnviarMensajeWAPasajero,
// un wrapper nuevo armado sobre dbo.WAX_Insertar_Mensaje_Extra (verificado que sí existe en la
// base y acepta @Telefono/@Texto con el mismo límite de 200 caracteres que usa este modal).
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroTelefono = String(body.nro_telefono || '').trim().replace(/\.\d*$/, '');
        const texto = String(body.texto || '').replace(/['"]/g, '');
        const idwa = parseInt(body.idwa, 10);
        const user = req.user || {};
        const nroOperador = user.userId !== undefined ? parseInt(user.userId, 10) : 1;

        if (!nroTelefono || !texto || isNaN(idwa)) {
            return res.status(400).json({
                success: false,
                error: 'Los parámetros nro_telefono, texto e idwa son requeridos'
            });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('NroTelefono', sql.VarChar(15), nroTelefono)
            .input('Texto', sql.VarChar(200), texto)
            .input('NroOperador', sql.Int, nroOperador)
            .input('IdWA', sql.Int, idwa)
            .execute('dbo.CFR_EnviarMensajeWAPasajero');

        res.json({
            success: true,
            message: 'Mensaje enviado al pasajero'
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en enviarMensajeWAPasajero: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al enviar el mensaje al pasajero'
        });
    }
};
