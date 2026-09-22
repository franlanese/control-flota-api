const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const queryParams = req.query.dir !== undefined ? req.query : req.body;
        const dir = queryParams.dir || '';
        const cod_localidad = parseInt(queryParams.cod_localidad, 10);

        if (isNaN(cod_localidad)) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro cod_localidad es requerido y debe ser numérico'
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Dir', sql.VarChar(150), `%${dir}%`)
            .input('CodLocalidad', sql.Int, cod_localidad)
            .execute('dbo.CFR_pedidosGetCalles_web');

        res.json(result.recordset);
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getCalles: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno al buscar calles'
        });
    }
};
