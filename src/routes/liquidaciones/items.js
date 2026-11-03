const { registrarErrorWeb } = require('../../utils/errorWeb');
const { llamarServicio, comoLista, authBearer, responderFallaServicio } = require('./servicio');

// Viajes de una liquidación (getLiqViajes de Pendientes, Confirmadas y Chofer: los tres iguales).
module.exports = async (req, res) => {
    try {
        const id = parseInt(req.params.idLiquidacion, 10);
        if (!Number.isInteger(id)) return res.status(400).json({ success: false, error: 'Liquidación inválida' });
        const r = await llamarServicio('getLiquidacionesItems', { idLiquidacion: id }, authBearer());
        if (!r.ok) return responderFallaServicio(res, null, 'Error al obtener los viajes de la liquidación');
        res.json({ success: true, data: comoLista(r.data) });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en liquidaciones/items:', err);
        responderFallaServicio(res, err, 'Error al obtener los viajes de la liquidación');
    }
};
