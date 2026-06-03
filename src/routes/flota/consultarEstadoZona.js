const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const nroMovil = body.nro_movil;

        if (nroMovil === undefined || nroMovil === null) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro nro_movil es requerido'
            });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('Nro_Movil', sql.Int, nroMovil)
            .execute('dbo.MF_EnviarConsultaMovil');

        res.json({
            success: true,
            message: 'Consulta de estado de zona enviada correctamente'
        });
    } catch (err) {
        console.error('Error en consultarEstadoZona: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al consultar el estado de la zona'
        });
    }
};
