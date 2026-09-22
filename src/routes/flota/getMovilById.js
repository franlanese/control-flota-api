const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroMovil = body.nro_movil;

        // Parámetros de contexto (con fallbacks correspondientes)
        const choferViaja = body.choferViaja !== undefined ? parseInt(body.choferViaja, 10) : 1;
        const nroFlota = body.nroFlota !== undefined ? parseInt(body.nroFlota, 10) : 0;

        if (nroMovil === undefined || nroMovil === null) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro nro_movil es requerido'
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('NroMovil', sql.Int, nroMovil)
            .input('ChoferViaja', sql.Int, choferViaja)
            .input('NroFlota', sql.Int, nroFlota)
            .execute('dbo.CFR_GetMovilById');

        // Retornamos el primer elemento devuelto, ya que nro_movil es único (PK)
        res.json({
            success: true,
            data: result.recordset[0] || null
        });

    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getMovilById: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener la información del móvil'
        });
    }
};
