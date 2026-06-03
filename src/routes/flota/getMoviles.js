const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};

        // Convertimos a booleanos/enteros adecuados para evitar errores de casteo en sql.Int
        const conMovilesPosicionValida = body.conMovilesPosicionValida === 'true' || body.conMovilesPosicionValida === true ? 1 : 0;
        const nroFlota = body.nroFlota !== undefined ? parseInt(body.nroFlota, 10) : 0;
        const choferViaja = body.choferViaja !== undefined ? parseInt(body.choferViaja, 10) : 1;
        const filtroMesas = body.filtroMesas || '';

        const pool = await poolPromise;
        const result = await pool.request()
            .input('ConMovilesPosicionValida', sql.Int, conMovilesPosicionValida)
            .input('NroFlota', sql.Int, nroFlota)
            .input('ChoferViaja', sql.Int, choferViaja)
            .input('FiltroMesas', sql.VarChar(sql.MAX), filtroMesas)
            .execute('dbo.CFR_GetMovilesInfo');

        res.json({
            success: true,
            data: {
                moviles: result.recordsets[0],
                totales: result.recordsets[1][0],
                now: result.recordsets[2][0]
            }
        });
    } catch (err) {
        console.error('Error getMoviles: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al procesar los móviles'
        });
    }
};