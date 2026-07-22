const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroViaje = body.nro_viaje;
        const nroMovil = body.nro_movil;
        const nroOperador = req.user ? req.user.userId : 1; // Proviene del JWT

        if (nroViaje === undefined || nroViaje === null || nroMovil === undefined || nroMovil === null) {
            return res.status(400).json({
                success: false,
                error: 'Los parámetros nro_viaje y nro_movil son requeridos'
            });
        }

        const pool = await poolPromise;

        // 1. Verificar si el móvil existe en la tabla MOVILES
        const checkMovil = await pool.request()
            .input('NroMovil', sql.Int, nroMovil)
            .query('SELECT nro_movil FROM MOVILES WHERE nro_movil = @NroMovil');

        if (checkMovil.recordset.length === 0) {
            return res.json({
                success: false,
                noexiste: `El número de móvil ${nroMovil} no existe.`
            });
        }

        // 2. Ejecutar stored procedure MF_PasarViajeaEstadoX
        await pool.request()
            .input('nro_viaje', sql.Int, nroViaje)
            .execute('dbo.MF_PasarViajeaEstadoX');

        // 3. Ejecutar stored procedure MF_AsignarMovil
        await pool.request()
            .input('nro_viaje', sql.Int, nroViaje)
            .input('NroMovil', sql.Int, nroMovil)
            .input('NroOperador', sql.Int, nroOperador)
            .execute('dbo.MF_AsignarMovil');

        res.json({
            success: true
        });
    } catch (err) {
        console.error('Error en asignarMovil: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al asignar móvil'
        });
    }
};
