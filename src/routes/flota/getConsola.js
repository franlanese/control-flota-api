const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};

        const user = req.user || {};

        // Parámetros de contexto del operador
        const userId = user.userId !== undefined ? parseInt(user.userId, 10) : 1; 
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
            .input('UserId', sql.Int, userId)
            .input('FiltroMesas', sql.VarChar(sql.MAX), filtroMesas)
            .execute('dbo.CFR_GetConsola');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en getConsola: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener los mensajes de consola'
        });
    }
};
