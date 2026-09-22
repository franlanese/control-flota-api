const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de AccionesController@enviarMensajeVariosMoviles (Laravel): a diferencia de
// enviarMensaje.js (un solo móvil, dbo.MF_EnviarmensajeOperaMovil), este ejecuta
// dbo.NU_MensajeVariosMoviles, que acepta @nro_movil como varchar con una lista separada
// por comas (ej. "104,105,") o uno de los códigos de difusión "9999,"/"9998,"/"9997,"
// (Todos/Libres/Ocupados respectivamente) — la traducción letra→código la arma el frontend.
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroMovil = body.nro_movil;
        const txt = body.txt;
        const isEmitir = body.isEmitir !== undefined ? parseInt(body.isEmitir, 10) : 1;
        const user = req.user || {};
        const nroOperador = user.userId !== undefined ? parseInt(user.userId, 10) : 1;

        if (!nroMovil || !txt) {
            return res.status(400).json({
                success: false,
                error: 'Los parámetros nro_movil y txt son requeridos'
            });
        }

        // Limpiar el texto quitando comillas simples y dobles para prevenir problemas en SQL Server
        const mensajeLimpio = String(txt).replace(/['"]/g, '');

        const pool = await poolPromise;
        await pool.request()
            .input('nro_movil', sql.VarChar(200), String(nroMovil))
            .input('Mensaje', sql.VarChar(200), mensajeLimpio)
            .input('NroOperador', sql.SmallInt, nroOperador)
            .input('Emitir', sql.SmallInt, isEmitir)
            .execute('dbo.NU_MensajeVariosMoviles');

        res.json({
            success: true,
            message: 'Mensaje enviado con éxito'
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en enviarMensajeVariosMoviles: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al enviar el mensaje a los móviles'
        });
    }
};
