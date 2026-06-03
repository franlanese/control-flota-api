const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroMovil = body.nro_movil !== undefined ? String(body.nro_movil) : '';
        const filtroMesas = body.filtroMesas || '';

        const pool = await poolPromise;
        const result = await pool.request()
            .input('NroMovil', sql.VarChar(50), nroMovil)
            .input('FiltroMesas', sql.VarChar(sql.MAX), filtroMesas)
            .execute('dbo.CFR_GetMovilesAutocomplete');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en getMovilesAutocomplete: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al autocompletar móviles'
        });
    }
};
