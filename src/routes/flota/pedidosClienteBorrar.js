const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroCliente = parseInt(body.nro_cliente, 10);

        if (!nroCliente || nroCliente <= 0) {
            return res.status(400).json({ success: false, error: 'nro_cliente inválido' });
        }

        const pool = await poolPromise;

        await pool.request()
            .input('NroCliente', sql.Int, nroCliente)
            .execute('dbo.NU_CLIENTE_BORRAR');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en pedidosClienteBorrar:', err);
        res.status(500).json({ success: false, error: 'Error interno al borrar domicilio' });
    }
};
