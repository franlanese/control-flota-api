const { sql, poolPromise } = require('../../../db');

// Réplica de AlarmaController@checkPanico (Laravel): posición/estado actual de UNA alarma
// puntual, usada para refrescar el mini-mapa del modal de Pánico mientras está abierto
// (ver checkPanico() en alarma/scripts.js — se consulta cada 2s). Ver CFR_CheckPanico (nuevo).
module.exports = async (req, res) => {
    try {
        const idAlarma = req.body ? req.body.id_alarma : undefined;
        if (idAlarma === undefined || idAlarma === null) {
            return res.status(400).json({ success: false, error: 'El parámetro id_alarma es requerido' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('IdAlarma', sql.Int, idAlarma)
            .execute('dbo.CFR_CheckPanico');

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error en checkPanico: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al comprobar el pánico' });
    }
};
