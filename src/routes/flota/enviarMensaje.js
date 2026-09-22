const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroMovil = body.nro_movil;
        const txt = body.txt;
        const isEmitir = body.isEmitir !== undefined ? parseInt(body.isEmitir, 10) : 1;
        const user = req.user || {};
        const nroOperador = user.userId !== undefined ? parseInt(user.userId, 10) : 1;

        if (nroMovil === undefined || nroMovil === null || !txt) {
            return res.status(400).json({
                success: false,
                error: 'Los parámetros nro_movil y txt son requeridos'
            });
        }

        // Limpiar el texto quitando comillas simples y dobles para prevenir problemas en SQL Server
        const mensajeLimpio = String(txt).replace(/['"]/g, '');

        const pool = await poolPromise;
        await pool.request()
            .input('nro_movil', sql.Int, parseInt(nroMovil, 10))
            .input('Mensaje', sql.VarChar(8000), mensajeLimpio)
            .input('NroOperador', sql.Int, nroOperador)
            .input('Emitir', sql.Int, isEmitir)
            .execute('dbo.MF_EnviarmensajeOperaMovil');

        res.json({
            success: true,
            message: 'Mensaje enviado al móvil con éxito'
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en enviarMensaje: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al enviar el mensaje al móvil'
        });
    }
};
