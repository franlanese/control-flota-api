const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { esEntero, validarCuenta, limiteONull } = require('./comun');

// Réplica de CtacteController@update. El saldo no se toca, y un límite vacío deja el que estaba:
// el SP ignora los NULL.
module.exports = async (req, res) => {
    try {
        const { nro_ctacte: nro } = req.params;
        const body = req.body || {};
        if (!esEntero(nro)) {
            return res.status(400).json({ success: false, error: 'Nro de Cuenta Corriente inválido' });
        }
        const invalido = validarCuenta(body);
        if (invalido) return res.status(400).json({ success: false, error: invalido });

        const pool = await poolPromise;
        await pool.request()
            .input('accion', sql.VarChar(1), 'M')
            .input('nro_ctacte', sql.Int, Number(nro))
            .input('nombre', sql.VarChar(60), String(body.nombre).trim())
            .input('saldo_actual', sql.Real, null)
            .input('limite_saldo', sql.Real, limiteONull(body.limite_saldo))
            .input('porcentaje', sql.SmallInt, Number(body.porcentaje))
            .execute('ABM_CTACTE');
        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en ABM_CTACTE (M):', err);
        res.status(500).json({ success: false, error: `No se pudo modificar la cuenta: ${err.message}` });
    }
};
