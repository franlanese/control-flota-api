const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de AgendadosController@getProximos (Laravel): dropdown "Agendados próximos a vencer"
// de la barra superior. TOP 5 por fec_fin_vigencia en los próximos 30 días, excluye los de
// única vez (opcion_agenda = 1) y filtra por la flota del usuario si tiene una.
module.exports = async (req, res) => {
    try {
        const nroFlota = req.user?.nro_flota ? parseInt(req.user.nro_flota, 10) || 0 : 0;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('NroFlota', sql.Int, nroFlota)
            .execute('CFR_Agendados_Proximos');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Agendados_Proximos:', err);
        res.status(500).json({ success: false, error: 'Error al obtener los agendados próximos a vencer' });
    }
};
