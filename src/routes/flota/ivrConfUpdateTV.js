const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const AikoOperador = body.AikoOperador;

        const pool = await poolPromise;
        await pool.request()
            .input('AikoOperador', sql.VarChar(100), AikoOperador !== undefined ? String(AikoOperador) : null)
            .execute('dbo.CFR_IVRConf_UpdateTV_web');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error al actualizar AikoOperador:', err);
        res.status(500).json({
            success: false,
            error: 'Error interno al actualizar la configuración del operador virtual'
        });
    }
};
