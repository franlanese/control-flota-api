const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { esEntero, esDuplicado, validarCuenta, limiteONull } = require('./comun');

// Réplica de CtacteController@store. Sin límite se guarda 0, que significa "sin límite".
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        if (!esEntero(body.nro_ctacte)) {
            return res.status(400).json({ success: false, error: 'Nro de Cuenta Corriente inválido' });
        }
        const invalido = validarCuenta(body);
        if (invalido) return res.status(400).json({ success: false, error: invalido });

        const pool = await poolPromise;
        await pool.request()
            .input('accion', sql.VarChar(1), 'A')
            .input('nro_ctacte', sql.Int, Number(body.nro_ctacte))
            .input('nombre', sql.VarChar(60), String(body.nombre).trim())
            .input('saldo_actual', sql.Real, 0)
            .input('limite_saldo', sql.Real, limiteONull(body.limite_saldo) ?? 0)
            .input('porcentaje', sql.SmallInt, Number(body.porcentaje))
            .execute('ABM_CTACTE');
        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en ABM_CTACTE (A):', err);
        if (esDuplicado(err)) {
            return res.status(409).json({ success: false, error: 'Ya existe una Cuenta Corriente con ese número.' });
        }
        res.status(500).json({ success: false, error: `No se pudo crear la cuenta: ${err.message}` });
    }
};
