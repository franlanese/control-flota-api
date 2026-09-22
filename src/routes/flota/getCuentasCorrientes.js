const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;

        // Ejecutamos el SP sin parámetros
        const result = await pool.request()
            .execute('dbo.CFR_GetCuentasCorrientes');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getCuentasCorrientes: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener las cuentas corrientes'
        });
    }
};
