const { registrarErrorWeb } = require('../../utils/errorWeb');
const { llamarServicio, comoLista, authBearer, responderFallaServicio } = require('./servicio');
const { filtrarPorFlota } = require('./flota');

// Réplica de LiqChoferController@getTabla: conductor y licencia son obligatorios.
module.exports = async (req, res) => {
    try {
        const { numero_chofer: numeroChofer, ra } = req.query;
        if (!numeroChofer || !ra) {
            return res.status(422).json({ success: false, error: 'Los campos Conductor y Licencia son obligatorios' });
        }
        const r = await llamarServicio('getLiquidacionesChofer', { nroConductor: numeroChofer, licencia: ra }, authBearer());
        if (!r.ok) return responderFallaServicio(res, null, 'Error al obtener las liquidaciones del conductor');
        res.json({ success: true, data: await filtrarPorFlota(req, comoLista(r.data)) });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en liquidaciones/chofer:', err);
        responderFallaServicio(res, err, 'Error al obtener las liquidaciones del conductor');
    }
};
