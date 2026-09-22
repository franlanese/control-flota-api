const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de AlarmaController@checkAlarma (Laravel): trae las alarmas de pánico activas
// (ALARMAS.Fecha_Hora_Fin IS NULL) de las últimas 6hs, respetando el mismo filtro de
// mesas y de flota que usa el resto de los endpoints de /flota. Se consulta cada pocos
// segundos desde el front para hacer parpadear la campanita mientras haya una emergencia
// en curso — ver CFR_CheckAlarma (nuevo).
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const user = req.user || {};

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
            .input('NroFlota', sql.Int, nroFlota)
            .input('ChoferViaja', sql.Int, choferViaja)
            .input('FiltroMesas', sql.VarChar(sql.MAX), filtroMesas)
            .execute('dbo.CFR_CheckAlarma');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en checkAlarma: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al comprobar alarmas'
        });
    }
};
