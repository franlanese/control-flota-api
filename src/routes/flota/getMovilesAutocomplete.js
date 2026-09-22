const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const user = req.user || {};
        const nroMovil = body.nro_movil !== undefined ? String(body.nro_movil) : '';
        let filtroMesas = '';
        if (user.nro_mesas && user.nro_mesas !== '0') {
            const mesas = String(user.nro_mesas).split('');
            filtroMesas = ' AND (nro_canal_comunicaciones = 0';
            for (const mesa of mesas) {
                filtroMesas += ` OR nro_canal_comunicaciones in (SELECT NroCanal from Mesas where NroMesa = ${parseInt(mesa, 10)})`;
            }
            filtroMesas += ')';
        }

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
        await registrarErrorWeb(err, req);
        console.error('Error en getMovilesAutocomplete: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al autocompletar móviles'
        });
    }
};
