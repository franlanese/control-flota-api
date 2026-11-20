const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { obtenerLimites } = require('../recorridos/limites');

// Recorrido de un viaje histórico — réplica de HistoricoController@getRecorridos (Laravel):
// posiciones del móvil asignado entre el inicio y el fin del viaje (±60 s), de MOVILES_POSICIONES.
// GET /api/historicos/recorrido?nro_movil=816&desde=2026-10-20T09:00:00&hasta=2026-10-20T09:40:00
//
// No sirve /flota/getPosicionesViajexId: su SP (CFR_GetRecorridoViaje) busca el viaje sólo en
// VIAJES (en curso) y para un histórico no devuelve nada. CFR_Recorridos_PorMovil hace la misma
// consulta que Laravel, con un tope de posiciones (el de la pantalla Recorridos).
// Fechas como texto 'YYYY-MM-DDTHH:mm[:ss]' (hora local) para que el driver no las corra de zona.
const FECHA_HORA_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
const conSegundos = f => (f.length === 16 ? `${f}:00` : f);

module.exports = async (req, res) => {
    try {
        const nroMovil = parseInt(req.query.nro_movil, 10);
        const { desde, hasta } = req.query;
        if (!Number.isInteger(nroMovil) || nroMovil <= 0) {
            return res.status(400).json({ success: false, error: 'El viaje no tiene móvil asignado' });
        }
        if (!FECHA_HORA_RE.test(desde || '') || !FECHA_HORA_RE.test(hasta || '')) {
            return res.status(400).json({ success: false, error: 'Se esperan desde y hasta como YYYY-MM-DDTHH:mm:ss' });
        }

        const { maxPosiciones } = obtenerLimites();
        const pool = await poolPromise;
        const result = await pool.request()
            .input('NroMovil', sql.Int, nroMovil)
            .input('Desde', sql.VarChar(19), conSegundos(desde))
            .input('Hasta', sql.VarChar(19), conSegundos(hasta))
            .input('MaxPosiciones', sql.Int, maxPosiciones)
            .execute('CFR_Recorridos_PorMovil');

        // El SP devuelve hasta maxPosiciones + 1 (la de más indica recorte): se descarta la más vieja.
        let posiciones = result.recordset || [];
        if (posiciones.length > maxPosiciones) posiciones = posiciones.slice(posiciones.length - maxPosiciones);

        res.json({ success: true, data: posiciones });
    } catch (err) {
        // Estado 10 del RAISERROR = el móvil no existe; fechas invertidas = dato mal cargado.
        const estado = err.originalError && err.originalError.info && err.originalError.info.state;
        if (estado === 10) return res.status(404).json({ success: false, error: err.message });
        if (/fecha hasta no puede ser anterior/i.test(err.message)) {
            return res.status(400).json({ success: false, error: err.message });
        }
        await registrarErrorWeb(err, req);
        console.error('Error en historicos/recorrido:', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener el recorrido' });
    }
};
