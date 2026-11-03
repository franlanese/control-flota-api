const { registrarErrorWeb } = require('../../utils/errorWeb');
const { llamarServicio, authBearer } = require('./servicio');
const { conBloqueo } = require('./bloqueo');

// Réplica de LiqPendientesController@abonarViaje. MUEVE DINERO: se abona contra el servicio externo.
// Usuario y nombre salen de la sesión, nunca del cuerpo del pedido.
module.exports = async (req, res) => {
    const id = parseInt(req.params.idLiquidacion, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, error: 'Liquidación inválida' });
    const ajuste = Number((req.body || {}).ajuste || 0);
    if (!Number.isFinite(ajuste)) return res.status(400).json({ success: false, error: 'El ajuste debe ser numérico' });
    const observaciones = String((req.body || {}).observaciones || '');

    return conBloqueo(`abonar:${id}`, res, async () => {
        try {
            const r = await llamarServicio('LiquidacionAbona', {
                idLiquidacion: id,
                idUsuario: req.user.userId,
                nombreUsuario: req.user.nombre,
                ajuste,
                observaciones,
            }, authBearer());
            if (!r.ok) return res.status(502).json({ success: false, error: 'Error al abonar la liquidación' });
            return res.json({ success: true, data: r.data });
        } catch (err) {
            await registrarErrorWeb(err, req);
            console.error(`Error al abonar la liquidación ${id}:`, err);
            // Sin respuesta no se sabe si el pago se hizo: el operador tiene que revisar antes de reintentar.
            if (err.name === 'TimeoutError') {
                return res.status(504).json({
                    success: false,
                    error: `El servicio no respondió y no se pudo confirmar el abono de la liquidación ${id}. Actualice la lista antes de reintentar: si ya no figura, se abonó.`,
                });
            }
            return res.status(502).json({ success: false, error: 'Error al abonar la liquidación' });
        }
    });
};
