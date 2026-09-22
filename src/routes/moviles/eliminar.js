const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const nroMovil = parseInt(req.params.nro_movil);
        const pool = await poolPromise;
        await pool.request()
            .input('nro_movil', sql.Int, nroMovil)
            .execute('CFR_Moviles_Delete');
        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Moviles_Delete:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
