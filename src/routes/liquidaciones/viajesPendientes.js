const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de ViajesPendLiqController@getTabla: viajes sin liquidar, con los totales de las dos
// columnas de importe. A diferencia del resto de Liquidaciones, sale de la base y no del servicio.
module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('CtaCte_ReporteViajesPendLiq');
        const data = result.recordset || [];
        const suma = campo => data.reduce((acc, f) => acc + (Number(f[campo]) || 0), 0);
        res.json({
            success: true,
            data,
            totales: { importeCtaCte: suma('Importe Cta Cte'), importeMovil: suma('Importe Movil') },
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CtaCte_ReporteViajesPendLiq:', err);
        res.status(500).json({ success: false, error: 'Error al obtener los viajes pendientes de liquidar' });
    }
};
