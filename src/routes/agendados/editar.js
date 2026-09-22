const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { crearViaje } = require('./_crearViaje');

// "Editar" en este sistema significa anular el viaje agendado y crear uno
// nuevo (no existe un UPDATE atómico) — mismo comportamiento que
// AgendadosController@modificar en Laravel.
module.exports = async (req, res) => {
    try {
        const nroViaje = parseInt(req.body.nro_viaje);
        if (!nroViaje) {
            return res.status(400).json({ success: false, error: 'nro_viaje es obligatorio' });
        }

        const pool = await poolPromise;
        const body = { ...req.body };

        // Si no vino el importe desde el front, recuperar el valor actual antes de anular
        if (body.importeDestino === undefined || body.importeDestino === null || body.importeDestino === '') {
            const row = await pool.request()
                .input('nro_viaje_agendado', sql.Int, nroViaje)
                .query('SELECT TOP 1 importe_pactado FROM viajes_agendados WHERE nro_viaje_agendado = @nro_viaje_agendado');
            body.importeDestino = row.recordset[0]?.importe_pactado ?? 0;
        }

        const nroFlota = parseInt(body.nro_flota_original) || 0;
        const usaCrear3 = nroFlota >= 100 && nroFlota <= 200;
        if (usaCrear3 && (body.pactado_taxi_sp === undefined || body.pactado_taxi_sp === null || body.pactado_taxi_sp === '')) {
            const row = await pool.request()
                .input('nro_viaje_agendado', sql.Int, nroViaje)
                .query('SELECT TOP 1 pactado_taxi FROM viajes_agendados WHERE nro_viaje_agendado = @nro_viaje_agendado');
            body.pactado_taxi_sp = row.recordset[0]?.pactado_taxi ?? 0;
        }

        const nroOperador = req.user?.userId || null;

        await pool.request()
            .input('NroViajeAgendado', sql.Int, nroViaje)
            .input('NroOperador', sql.Int, nroOperador)
            .execute('NU_ViajeAgendado_Anular');

        await crearViaje(pool, body, nroOperador);

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error al editar viaje agendado:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
