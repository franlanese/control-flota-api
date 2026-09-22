const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const user = req.user || {};

        // Convertimos a booleanos/enteros adecuados para evitar errores de casteo en sql.Int
        const conMovilesPosicionValida = body.conMovilesPosicionValida === 'true' || body.conMovilesPosicionValida === true ? 1 : 0;
        
        // Contexto del operador autenticado
        const nroFlota = user.nro_flota !== undefined && user.nro_flota !== null ? parseInt(user.nro_flota, 10) : 0;
        const choferViaja = body.choferViaja !== undefined ? parseInt(body.choferViaja, 10) : 1;
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
        await registrarErrorWeb(err, req);
        console.error('Error getMoviles: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al procesar los móviles'
        });
    }
};