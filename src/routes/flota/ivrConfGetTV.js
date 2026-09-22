const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .execute('dbo.CFR_IVRConf_GetTV_web');

        const AikoOperador = result.recordset[0] ? result.recordset[0].AikoOperador : null;

        res.json({ AikoOperador });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error al obtener AikoOperador:', err);
        res.status(500).json({
            success: false,
            error: 'Error interno al obtener la configuración del operador virtual'
        });
    }
};
