const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de HistoricoController@cambiarEstado (Laravel): reutiliza el SP de negocio
// MF_CambiarEstadoViajeSalud tal cual, sin crear nada nuevo. No recibe un código de estado:
// el propio SP decide la transición a partir de @nro_viaje y @NroOperador.
//
// ⚠️ Esta SP NO existe en la base "Demo" actual (se verificó con sys.objects antes de
// escribir este archivo) — probablemente sí exista en la base de producción de la que viene
// el resto de la lógica de negocio. El wiring queda listo; si al probar da
// "Could not find stored procedure 'MF_CambiarEstadoViajeSalud'" es justamente eso, no un
// bug de este endpoint.
module.exports = async (req, res) => {
    try {
        const nroViaje = req.body?.nro_viaje;
        if (nroViaje === undefined || nroViaje === null) {
            return res.status(400).json({ success: false, error: 'El parámetro nro_viaje es requerido' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('nro_viaje', sql.Int, nroViaje)
            .input('NroOperador', sql.Int, req.user.userId)
            .execute('MF_CambiarEstadoViajeSalud');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en historicos/cambiarEstado:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
