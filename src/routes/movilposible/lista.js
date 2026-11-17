const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Móviles que pasaron cerca de un punto en una fecha y hora — réplica de
// MovilPosibleController@getTabla (Laravel). El SP NU_MovilPosible (preexistente, no se toca)
// busca en MOVILES_POSICIONES a ±0,003° del punto entre 7 minutos antes y 3 después de la hora.
// GET /api/movilposible?latitud=-32.95&longitud=-60.64&fecha_hora=2026-11-12T10:30
//
// La fecha-hora viaja al SP como TEXTO ('YYYY-MM-DDTHH:mm:ss'), no como sql.DateTime: db.js usa
// useUTC: false y un Date de JavaScript se correría de zona horaria (mismo criterio que
// recorridos/lista.js). SQL Server convierte el ISO con 'T' a DATETIME con cualquier DATEFORMAT.
const FECHA_HORA_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

module.exports = async (req, res) => {
    try {
        const latitud = parseFloat(req.query.latitud);
        const longitud = parseFloat(req.query.longitud);
        const fechaHora = req.query.fecha_hora || '';

        if (!Number.isFinite(latitud) || !Number.isFinite(longitud) || (latitud === 0 && longitud === 0)) {
            return res.status(400).json({ success: false, error: 'Cargue una dirección válida' });
        }
        if (!FECHA_HORA_RE.test(fechaHora)) {
            return res.status(400).json({ success: false, error: 'La fecha y hora son obligatorias' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Latitud', sql.Real, latitud)
            .input('Longitud', sql.Real, longitud)
            .input('FechaHora', sql.VarChar(19), fechaHora.length === 16 ? `${fechaHora}:00` : fechaHora)
            .execute('NU_MovilPosible');

        res.json({ success: true, data: result.recordset || [] });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en NU_MovilPosible:', err);
        res.status(500).json({ success: false, error: 'No se pudo realizar la búsqueda, vuelva a intentarlo' });
    }
};
