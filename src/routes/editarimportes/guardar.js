const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

const numero = v => (v === null || v === undefined || String(v).trim() === '' ? NaN : Number(v));

// Réplica de EditarImportesController@guardar (ViajeEditarImportes, acción M). Modifica importes.
//
// OJO, bug conocido del SP (no se puede modificar desde acá, es un contrato fijo): al guardar, pisa
// las observaciones del viaje con las de una transacción cualquiera de TransaccionCC, porque lee
// esa tabla sin filtrar por viaje. Ver docs/decisions/0004.
module.exports = async (req, res) => {
    try {
        const { nro_viaje: nro, importe_ctacte: ctacte, importe_taxi: taxi } = req.body || {};
        const nroViaje = parseInt(nro, 10);
        if (!Number.isInteger(nroViaje)) {
            return res.status(400).json({ success: false, error: 'El número de viaje es requerido y debe ser numérico.' });
        }
        if (!Number.isFinite(numero(ctacte)) || !Number.isFinite(numero(taxi))) {
            return res.status(400).json({ success: false, error: 'Los importes deben ser numéricos.' });
        }
        const pool = await poolPromise;
        await pool.request()
            .input('accion', sql.VarChar(1), 'M')
            .input('nroViaje', sql.Int, nroViaje)
            .input('ImporteCtaCte', sql.Real, numero(ctacte))
            .input('ImporteTaxi', sql.Real, numero(taxi))
            .execute('ViajeEditarImportes');
        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en ViajeEditarImportes (M):', err);
        res.status(500).json({ success: false, error: 'Error al guardar los importes' });
    }
};
