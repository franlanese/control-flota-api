const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const user = req.user || {};
        const userFlota = user.nro_flota !== undefined && user.nro_flota !== null ? parseInt(user.nro_flota, 10) : 0;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserFlota', sql.Int, userFlota)
            .execute('dbo.CFR_pedidosGetPedidosData_web');

        res.json({
            success: true,
            localidades: result.recordsets[0] || [],
            cta: result.recordsets[1] || [],
            subcta: result.recordsets[2] || [],
            condiciones: result.recordsets[3] || []
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getPedidosData: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener metadatos de pedidos'
        });
    }
};
