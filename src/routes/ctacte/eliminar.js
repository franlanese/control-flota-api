const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { esEntero } = require('./comun');

// Réplica de CtacteController@destroy.
module.exports = async (req, res) => {
    try {
        const { nro_ctacte: nro } = req.params;
        if (!esEntero(nro)) {
            return res.status(400).json({ success: false, error: 'Nro de Cuenta Corriente inválido' });
        }
        const pool = await poolPromise;
        await pool.request()
            .input('accion', sql.VarChar(1), 'B')
            .input('nro_ctacte', sql.Int, Number(nro))
            .execute('ABM_CTACTE');
        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en ABM_CTACTE (B):', err);
        res.status(500).json({ success: false, error: `No se pudo borrar la cuenta: ${err.message}` });
    }
};
