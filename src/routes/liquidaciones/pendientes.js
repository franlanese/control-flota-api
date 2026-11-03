const { registrarErrorWeb } = require('../../utils/errorWeb');
const { llamarServicio, comoLista, authBearer, responderFallaServicio } = require('./servicio');
const { filtrarPorFlota } = require('./flota');

// Réplica de LiqPendientesController@getTabla. `liqDoble` es CONF_DOBLELIQ (LiqDoble en Laravel):
// si está activo, una liquidación con viajes de tipo S y T saca un comprobante por cada tipo.
module.exports = async (req, res) => {
    try {
        const r = await llamarServicio('getLiquidacionesPendientes', {}, authBearer());
        if (!r.ok) return responderFallaServicio(res, null, 'Error al obtener las liquidaciones pendientes');
        const data = await filtrarPorFlota(req, comoLista(r.data));
        res.json({ success: true, data, liqDoble: Number(process.env.CONF_DOBLELIQ || 0) !== 0 });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en liquidaciones/pendientes:', err);
        responderFallaServicio(res, err, 'Error al obtener las liquidaciones pendientes');
    }
};
