const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de EditarImportesController@consultar (ViajeEditarImportes, acción C). Un viaje sin
// ImporteTaxiLiq se muestra pero no se puede editar: no está disponible para liquidar al chofer.
module.exports = async (req, res) => {
    try {
        const nroViaje = parseInt((req.body || {}).nro_viaje, 10);
        if (!Number.isInteger(nroViaje)) {
            return res.status(400).json({ success: false, error: 'El número de viaje es requerido y debe ser numérico.' });
        }
        const pool = await poolPromise;
        const result = await pool.request()
            .input('accion', sql.VarChar(1), 'C')
            .input('nroViaje', sql.Int, nroViaje)
            .execute('ViajeEditarImportes');

        const viaje = (result.recordset || [])[0];
        if (!viaje) {
            return res.status(404).json({ success: false, error: 'No se encontró el viaje con el número especificado.' });
        }
        const disponible = viaje.ImporteTaxiLiq !== null && viaje.ImporteTaxiLiq !== undefined;
        res.json({
            success: true,
            data: viaje,
            disponible,
            mensaje: disponible ? null : 'El viaje no se encuentra disponible para ser liquidado por el chofer.',
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en ViajeEditarImportes (C):', err);
        res.status(500).json({ success: false, error: 'Error al consultar el viaje' });
    }
};
