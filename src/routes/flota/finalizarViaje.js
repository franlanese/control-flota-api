const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de AccionesController@finalizarViaje (Laravel). El SP pasa el viaje a VIAJES_HISTORICOS,
// lo borra de VIAJES y registra al operador en EVENTOS_OPERADOR.
module.exports = async (req, res) => {
    try {
        const nroViaje = parseInt((req.body || {}).nro_viaje, 10);

        if (isNaN(nroViaje)) {
            return res.status(400).json({ success: false, error: 'El parámetro nro_viaje es requerido' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('nro_viaje', sql.Int, nroViaje)
            .input('NroOperador', sql.SmallInt, req.user.userId)
            .execute('dbo.NU_FinalizarViaje');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en NU_FinalizarViaje: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al finalizar el viaje' });
    }
};
