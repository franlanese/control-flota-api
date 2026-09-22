const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de MensajesMovilesController@getAllMensajes (minichat.blade.php / minichat.js):
// UNION de MENSAJES_MOVILES ('M') + MENSAJES_CHOFER ('C') + MENSAJES_EVENTOS ('E'),
// filtrado por mesas de despacho del operador y, si tiene, su flota. En Laravel esto
// se pollea cada 5s desde el cliente (ver minichat.js), acá lo replicamos igual del lado React.
module.exports = async (req, res) => {
    try {
        const user = req.user || {};

        // Mismo armado de filtro de mesas que ya usa getConsola.js — el fragmento de SQL
        // variable (cantidad de mesas) se arma acá porque no se puede pasar como parámetro.
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

        // Réplica de $flota en getAllMensajes: si el usuario tiene una flota asignada,
        // solo ve mensajes de móviles de esa flota.
        let flota = '';
        const nroFlota = user.nro_flota !== undefined ? parseInt(user.nro_flota, 10) : 0;
        if (nroFlota) {
            flota = ` AND MOVILES.Nro_Flota = ${nroFlota}`;
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserId', sql.Int, userId)
            .input('FiltroMesas', sql.VarChar(sql.MAX), filtroMesas)
            .input('Flota', sql.VarChar(sql.MAX), flota)
            .execute('dbo.CFR_GetMensajesChat');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getMensajesChat: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener los mensajes del chat'
        });
    }
};
