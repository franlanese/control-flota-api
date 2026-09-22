const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const queryParams = req.method === 'GET' ? req.query : req.body;
        const { nombrecalle, nropuerta } = queryParams;
        const cod_localidad = parseInt(queryParams.cod_localidad, 10);

        if (!nombrecalle || !nropuerta || isNaN(cod_localidad)) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros nombrecalle, nropuerta (calle cruce) y cod_localidad son requeridos'
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('NombreCalle', sql.VarChar(150), String(nombrecalle))
            .input('NombreCalle1', sql.VarChar(150), String(nropuerta))
            .input('CodLocalidad', sql.Int, cod_localidad)
            .execute('dbo.NU_Domicilio_ReferenciaHistoricaEsquina');

        res.json(result.recordset);
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en referenciaHistoricaEsquina: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener referencia histórica por esquina'
        });
    }
};
