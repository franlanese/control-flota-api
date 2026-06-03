const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroMovil = body.nro_movil;
        const nroOperador = body.nroOperador !== undefined ? body.nroOperador : 1; // Fallback a 1 si no se provee

        if (nroMovil === undefined || nroMovil === null) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro nro_movil es requerido'
            });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('Nro_Movil', sql.Int, nroMovil)
            .input('NroOperador', sql.Int, nroOperador)
            .execute('dbo.MF_PonerPrimeroEnBase');

        res.json({
            success: true,
            message: 'Móvil posicionado primero en base con éxito'
        });
    } catch (err) {
        console.error('Error en ponerPrimero: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al poner primero al móvil'
        });
    }
};
