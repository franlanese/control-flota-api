const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const conf = parseInt(body.conf, 10);
        const confWA = parseInt(body.confWA, 10);

        if (isNaN(conf) || isNaN(confWA)) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros conf y confWA son requeridos y deben ser numéricos'
            });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('Estado', sql.Int, conf)
            .input('EstadoWeb', sql.Int, confWA)
            .execute('dbo.CFR_IVRConf_Update_web');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error al actualizar CONFIG_SIS:', err);
        res.status(500).json({
            success: false,
            error: 'Error interno al actualizar la configuración de IVR/WhatsApp'
        });
    }
};
