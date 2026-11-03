const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { esEntero } = require('../ctacte/comun');

// Réplica de SubctaController@destroy.
module.exports = async (req, res) => {
    try {
        const { nroCtaCte, nroDivision, nroSubcta } = req.params;
        if (![nroCtaCte, nroDivision, nroSubcta].every(esEntero)) {
            return res.status(400).json({ success: false, error: 'SubCuenta inválida' });
        }
        const pool = await poolPromise;
        await pool.request()
            .input('accion', sql.Char(1), 'B')
            .input('nro_ctacte', sql.Int, Number(nroCtaCte))
            .input('nro_division', sql.Int, Number(nroDivision))
            .input('nro_subcta', sql.Int, Number(nroSubcta))
            .execute('ABM_SUBCTA');
        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en ABM_SUBCTA (B):', err);
        res.status(500).json({ success: false, error: 'No se pudo borrar la SubCuenta' });
    }
};
