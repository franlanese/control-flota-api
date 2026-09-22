const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { crearViaje } = require('./_crearViaje');

module.exports = async (req, res) => {
    try {
        if (!req.body.nro_cliente || !req.body.horaViaje) {
            return res.status(400).json({ success: false, error: 'Cliente y hora del viaje son obligatorios' });
        }

        const pool = await poolPromise;
        const nroOperador = req.user?.userId || null;
        await crearViaje(pool, req.body, nroOperador);

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error al crear viaje agendado:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
