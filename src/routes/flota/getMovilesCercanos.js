const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const user = req.user || {};
        const nroViaje = body.nro_viaje;
        
        // Contexto del operador autenticado
        const nroFlota = user.nro_flota !== undefined && user.nro_flota !== null ? parseInt(user.nro_flota, 10) : 0;
        const choferViaja = body.choferViaja !== undefined ? parseInt(body.choferViaja, 10) : 1;

        if (nroViaje === undefined || nroViaje === null) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro nro_viaje es requerido'
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('IdViaje', sql.Int, nroViaje)
            .execute('dbo.NU_Moviles_cercanos');

        let moviles = result.recordset;

        // Replicamos el filtrado condicional por flota del usuario (Líneas 489-494)
        if ((choferViaja === 2 || choferViaja === 0) && nroFlota !== 0) {
            moviles = moviles.filter(movil => {
                return movil.nro_flota !== undefined && movil.nro_flota === nroFlota;
            });
        }

        res.json({
            success: true,
            data: moviles
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getMovilesCercanos: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al calcular los móviles cercanos'
        });
    }
};
