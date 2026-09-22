const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de AlarmaController@consultarMovilPanico (Laravel): dispara una "consulta" al móvil
// (mismo SP MF_EnviarConsultaMovil que usa el resto del sistema — no se toca) desde el botón
// "Consultar" del modal de Pánico.
module.exports = async (req, res) => {
    try {
        const nroMovil = req.body ? req.body.nro_movil : undefined;
        if (nroMovil === undefined || nroMovil === null) {
            return res.status(400).json({ success: false, error: 'El parámetro nro_movil es requerido' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('Nro_Movil', sql.Int, nroMovil)
            .execute('dbo.MF_EnviarConsultaMovil');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en consultarMovilPanico: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al consultar el móvil' });
    }
};
