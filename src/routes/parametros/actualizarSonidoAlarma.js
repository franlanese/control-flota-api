const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de ParametrosController@updateAlarma: activa o desactiva el sonido de la alarma.
module.exports = async (req, res) => {
    try {
        const { sonidoAlarma } = req.body || {};

        if (typeof sonidoAlarma !== 'boolean') {
            return res.status(400).json({ success: false, error: 'sonidoAlarma debe ser true o false' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('Activo', sql.Bit, sonidoAlarma)
            .execute('CFR_Parametros_SonidoAlarma_Actualizar');

        res.json({ success: true, data: { sonidoAlarma } });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Parametros_SonidoAlarma_Actualizar:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
