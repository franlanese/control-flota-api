const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

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
        const result = await pool.request()
            .input('NroMovil', sql.Int, parseInt(nroMovil, 10))
            .query(`
                SELECT TOP 30 *
                FROM (
                    SELECT 'M' as tipo, texto, nro_movil, '' as nombre, estado_mensaje, fecha_hora_envio, convert(varchar(20), fecha_hora_envio, 8) as fecha_envio, nro_operador, NuUsuarios.nombre AS nombre_telefonista
                    FROM MENSAJES_MOVILES
                    LEFT JOIN NuUsuarios on MENSAJES_MOVILES.nro_operador = NuUsuarios.user_id
                    WHERE fecha_hora_envio > dateadd(n,-360,getdate()) AND nro_movil = @NroMovil AND nro_movil != 9999 AND nro_movil != 9998 AND nro_movil != 9997
                    UNION
                    SELECT 'C' as tipo, texto, nro_movil, nombre_conductor, estado_mensaje, fecha_hora_envio, convert(varchar(20), fecha_hora_envio, 8) as fecha_envio, Nro_Telefonista, NuUsuarios.nombre AS nombre_telefonista
                    FROM MENSAJES_CHOFER
                    LEFT JOIN NuUsuarios on MENSAJES_CHOFER.Nro_Telefonista = NuUsuarios.user_id
                    WHERE fecha_hora_envio > dateadd(n,-360,getdate()) AND nro_movil = @NroMovil AND nro_movil != 9999 AND nro_movil != 9998 AND nro_movil != 9997
                ) AS mensajes
                ORDER BY fecha_hora_envio DESC
            `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getMensajesMovil: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener los mensajes del móvil'
        });
    }
};
