const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const nroFlota = req.user?.nro_flota ? parseInt(req.user.nro_flota) : null;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('NroFlota', sql.Int, nroFlota)
            .execute('CFR_Agendados_Lista');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Agendados_Lista:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
