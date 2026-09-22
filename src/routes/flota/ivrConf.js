const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .execute('dbo.CFR_IVRConf_Get_web');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error al obtener CONFIG_SIS:', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener la configuración de IVR/WhatsApp'
        });
    }
};
