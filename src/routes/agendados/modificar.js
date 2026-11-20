const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// "Modificar" del menú de la grilla de agendados del panel de flota: cambia fecha/hora del
// agendado. Réplica de AccionesAgendadosController@modificarAgendado: mismos parámetros a
// NU_ViajeAgendado_Modificar (vigencia ini = fin = la nueva fecha; mueve el próximo item futuro).
// El SP no informa errores (los atrapa sin devolverlos), igual que en Laravel.
module.exports = async (req, res) => {
    try {
        const nroViajeAgendado = parseInt(req.params.nro_viaje_agendado);
        const { fecha, hora } = req.body || {}; // 'YYYY-MM-DD' y 'HH:mm'
        if (!nroViajeAgendado) {
            return res.status(400).json({ success: false, error: 'nro_viaje_agendado inválido' });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !/^\d{2}:\d{2}$/.test(hora || '')) {
            return res.status(400).json({ success: false, error: 'Se espera fecha YYYY-MM-DD y hora HH:mm' });
        }

        // Como texto (no Date): el driver trata los datetime como UTC y correría la hora.
        // 'YYYY-MM-DDTHH:mm:ss' es ISO 8601, SQL Server lo lee igual con cualquier DATEFORMAT.
        const pool = await poolPromise;
        await pool.request()
            .input('NroViajeAgendado', sql.Int, nroViajeAgendado)
            .input('HoraViaje', sql.VarChar(5), hora)
            .input('FechaIniVigencia', sql.VarChar(10), fecha)
            .input('FechaFinVigencia', sql.VarChar(10), fecha)
            .input('FechaHora', sql.VarChar(19), `${fecha}T${hora}:00`)
            .execute('NU_ViajeAgendado_Modificar');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en NU_ViajeAgendado_Modificar:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
