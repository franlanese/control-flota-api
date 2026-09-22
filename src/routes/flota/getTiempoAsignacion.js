const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .execute('dbo.NU_TiempoParaAsignar');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getTiempoAsignacion: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener el tiempo para asignar'
        });
    }
};
