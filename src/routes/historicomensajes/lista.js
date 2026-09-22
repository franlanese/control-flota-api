const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de HistoricoMensajeController@getTabla (Laravel): esa pantalla no tenía SP, la query
// (UNION de MENSAJES_MOVILES + MENSAJES_CHOFER) estaba armada a mano en el controlador. Se
// creó dbo.CFR_HistoricoMensajes_Lista nuevo para esto — el usuario ya lo tiene en la base.
//
// tipo: 1 = Móvil, 2 = Emisor, 3 = Texto (igual que "dato1" en Laravel). Sin parametro = sin filtro.
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const { desde, hasta, tipo, parametro } = body;

        if (!desde || !hasta) {
            return res.status(400).json({ success: false, error: 'desde y hasta son requeridos' });
        }

        const tieneParametro = parametro !== undefined && parametro !== null && String(parametro).trim() !== '';

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Desde', sql.DateTime, new Date(desde))
            .input('Hasta', sql.DateTime, new Date(hasta))
            .input('Tipo', sql.Int, tieneParametro ? parseInt(tipo, 10) : null)
            .input('Parametro', sql.VarChar(100), tieneParametro ? String(parametro).trim() : null)
            .execute('dbo.CFR_HistoricoMensajes_Lista');

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en historicomensajes/lista: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener el histórico de mensajes'
        });
    }
};
