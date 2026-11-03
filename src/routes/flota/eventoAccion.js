const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Acciones del modal de Eventos — réplica de FlotaController@AccionesEventos:
//   G  genera un viaje gemelo, con los mismos datos del viaje del evento
//   D  reporta que la posición del domicilio está mal (lo guarda en DomiciliosHistoricos)
//   S  sale sin hacer nada
// En los tres casos el SP además marca los eventos de ese viaje como atendidos
// (Estado_Mensaje = 'T', con el operador y la hora), y por eso dejan de aparecer en el menú.
//
// Laravel llamaba al SP original Eventos_acciones. Acá se usa CFR_Eventos_AccionModal, que
// hace lo mismo: el original no se puede ejecutar en esta base (asigna variables en un SELECT
// con UNION, que SQL Server rechaza), y los SP originales no se modifican.
const ACCIONES = ['G', 'D', 'S'];

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroViaje = parseInt(body.nro_viaje, 10);
        const accion = String(body.accion || '').trim().toUpperCase();

        if (!Number.isInteger(nroViaje) || nroViaje <= 0) {
            return res.status(400).json({ success: false, error: 'El parámetro nro_viaje es requerido' });
        }
        if (!ACCIONES.includes(accion)) {
            return res.status(400).json({ success: false, error: 'Acción inválida: se espera G, D o S' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('IdViaje', sql.Int, nroViaje)
            .input('Accion', sql.VarChar(5), accion)
            .input('Usuario', sql.SmallInt, req.user.userId)
            .execute('dbo.CFR_Eventos_AccionModal');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Eventos_AccionModal:', err);
        res.status(500).json({ success: false, error: 'No se pudo actualizar el evento' });
    }
};
