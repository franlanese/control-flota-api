const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const nroConductor = parseInt(req.params.nro_conductor);
        const pool = await poolPromise;
        await pool.request()
            .input('nro_conductor', sql.Int, nroConductor)
            .execute('CFR_Conductores_Delete');
        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Conductores_Delete:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
