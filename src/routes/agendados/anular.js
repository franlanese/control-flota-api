const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const nroViajeAgendado = parseInt(req.params.nro_viaje_agendado);
        const pool = await poolPromise;
        await pool.request()
            .input('NroViajeAgendado', sql.Int, nroViajeAgendado)
            .input('NroOperador', sql.Int, req.user?.userId || null)
            .execute('NU_ViajeAgendado_Anular');
        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en NU_ViajeAgendado_Anular:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
