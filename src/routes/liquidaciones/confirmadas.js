const { registrarErrorWeb } = require('../../utils/errorWeb');
const { llamarServicio, comoLista, authBearer, responderFallaServicio } = require('./servicio');
const { filtrarPorFlota } = require('./flota');

// Réplica de LiqConfirmadasController@getTabla. tipo: '1' = licencia, '2' = conductor.
// Las fechas llegan del <input type="datetime-local"> ('YYYY-MM-DDTHH:mm') y el servicio las
// espera con segundos. Si faltan, no se mandan (Laravel tampoco).
const FECHA_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

module.exports = async (req, res) => {
    try {
        const { tipo, valor, desde, hasta } = req.query;
        const params = {};
        if (FECHA_RE.test(desde || '')) params.desde = `${desde}:00`;
        if (FECHA_RE.test(hasta || '')) params.hasta = `${hasta}:00`;
        if (tipo === '1' && valor) params.licencia = valor;
        else if (tipo === '2' && valor) params.idConductor = valor;

        const r = await llamarServicio('getLiquidacionesConfirmadasParam', params, authBearer());
        if (!r.ok) return responderFallaServicio(res, null, 'Error al obtener las liquidaciones confirmadas');
        res.json({ success: true, data: await filtrarPorFlota(req, comoLista(r.data)) });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en liquidaciones/confirmadas:', err);
        responderFallaServicio(res, err, 'Error al obtener las liquidaciones confirmadas');
    }
};
