const { registrarErrorWeb } = require('../../utils/errorWeb');
const { llamarServicio, comoLista, authApiKey, responderFallaServicio } = require('./servicio');
const { movilEsDeSuFlota } = require('./flota');
const { conBloqueo } = require('./bloqueo');

// Réplica de LiqGenerarController. Tipo C consulta y Tipo L LIQUIDA (no se puede deshacer).
// Los tres validan móvil, conductor y que el móvil sea de la flota del usuario.
async function validar(req, res) {
    const { id_movil: idMovil, id_conductor: idConductor } = { ...req.query, ...(req.body || {}) };
    if (!idMovil || !idConductor) {
        res.status(422).json({ success: false, error: 'Debe ingresar Móvil y Conductor' });
        return null;
    }
    if (!(await movilEsDeSuFlota(req, idMovil))) {
        res.status(403).json({ success: false, error: 'El móvil no pertenece a su flota' });
        return null;
    }
    return { IdMovil: idMovil, IdConductor: idConductor };
}

async function manejarError(req, res, err, mensaje) {
    await registrarErrorWeb(err, req);
    console.error(`Error en liquidaciones/generar: ${mensaje}`, err);
    return responderFallaServicio(res, err, mensaje);
}

async function consultar(req, res) {
    const mensaje = 'Error al consultar la liquidación';
    try {
        const params = await validar(req, res);
        if (!params) return;
        const r = await llamarServicio('getLiquidacion', { ...params, Tipo: 'C' }, authApiKey());
        if (!r.ok) return responderFallaServicio(res, null, mensaje);
        res.json({ success: true, data: comoLista(r.data)[0] || null });
    } catch (err) { await manejarError(req, res, err, mensaje); }
}

async function viajes(req, res) {
    const mensaje = 'Error al obtener los viajes sin liquidar';
    try {
        const params = await validar(req, res);
        if (!params) return;
        const r = await llamarServicio('getViajesSinLiquidar', { ...params, Cantidad: 0 }, authApiKey());
        if (!r.ok) return responderFallaServicio(res, null, mensaje);
        res.json({ success: true, data: comoLista(r.data) });
    } catch (err) { await manejarError(req, res, err, mensaje); }
}

async function liquidar(req, res) {
    const mensaje = 'Error al liquidar los viajes';
    try {
        const params = await validar(req, res);
        if (!params) return;
        await conBloqueo(`liquidar:${params.IdMovil}:${params.IdConductor}`, res, async () => {
            const r = await llamarServicio('getLiquidacion', { ...params, Tipo: 'L' }, authApiKey());
            if (!r.ok) return responderFallaServicio(res, null, mensaje);
            return res.json({ success: true, data: comoLista(r.data)[0] || null });
        });
    } catch (err) {
        // Sin respuesta no se sabe si se liquidó: hay que volver a consultar antes de reintentar.
        if (err.name === 'TimeoutError') {
            return res.status(504).json({
                success: false,
                error: 'El servicio no respondió y no se pudo confirmar la liquidación. Vuelva a buscar antes de reintentar.',
            });
        }
        await manejarError(req, res, err, mensaje);
    }
}

module.exports = { consultar, viajes, liquidar };
