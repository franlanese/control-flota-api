const { poolPromise, sql } = require('../../../db');

// Suspende (borra) un día puntual de un viaje agendado recurrente,
// sin anular el resto de las repeticiones.
module.exports = async (req, res) => {
    try {
        const nroViajeAgendado = parseInt(req.params.nro_viaje_agendado);
        const fecha = req.params.fecha_agendado; // formato esperado: YYYY-MM-DD
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha || '');
        if (!m) {
            return res.status(400).json({ success: false, error: 'Formato de fecha inválido, se espera YYYY-MM-DD' });
        }
        const fechaItem = `${m[1]}${m[2]}${m[3]}`;

        const pool = await poolPromise;
        await pool.request()
            .input('NroViajeAgendado', sql.Int, nroViajeAgendado)
            .input('FechaItem', sql.VarChar(8), fechaItem)
            .input('NroOperador', sql.Int, req.user?.userId || null)
            .execute('NU_ViajeAgendado_BorrarItem');

        res.json({ success: true });
    } catch (err) {
        console.error('Error en NU_ViajeAgendado_BorrarItem:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
