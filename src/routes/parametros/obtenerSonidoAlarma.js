const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de la lectura de 'SonidoAlarmaWeb' en ParametrosController@index: indica si la
// alarma de pánico suena en la web. Es un valor de la instalación, no de cada usuario.
module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SET NOCOUNT ON; EXEC CFR_Parametros_SonidoAlarma_Obtener');
        const fila = result.recordset[0];
        res.json({ success: true, data: { sonidoAlarma: !fila || fila.sonido_alarma !== 0 } });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Parametros_SonidoAlarma_Obtener:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
