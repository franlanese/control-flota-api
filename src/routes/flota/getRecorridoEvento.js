const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Recorrido del viaje para el modal de Eventos — réplica de FlotaController@getPosicionesViajexId
// (Laravel), que ejecuta Viaje_Recorrido. Es un endpoint aparte de /getPosicionesViajexId a
// propósito: ese usa CFR_GetRecorridoViaje, que sólo busca en VIAJES (viajes en curso) y para
// un viaje ya terminado no devuelve nada. Los eventos (A, OL) casi siempre son de viajes que ya
// pasaron a VIAJES_HISTORICOS, y Viaje_Recorrido sí los encuentra.
module.exports = async (req, res) => {
    try {
        const nroViaje = parseInt((req.body || {}).nro_viaje, 10);
        if (!Number.isInteger(nroViaje)) {
            return res.status(400).json({ success: false, error: 'El parámetro nro_viaje es requerido' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('NroViaje', sql.Int, nroViaje)
            .execute('dbo.Viaje_Recorrido');

        // Se descartan las posiciones sin GPS: el equipo del móvil manda 0,0 cuando todavía no
        // tiene señal, y Viaje_Recorrido no las filtra. Sin esto, el inicio del recorrido quedaba
        // en 0,0 (océano, frente a África) y el mapa se alejaba hasta mostrar medio planeta.
        // Mismo criterio que CFR_GetRecorridoViaje: (latitud != 0 OR longitud != 0).
        const posiciones = (result.recordset || []).filter(p =>
            Number(p.latitud) !== 0 || Number(p.longitud) !== 0
        );

        res.json({ success: true, data: posiciones });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getRecorridoEvento: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener el recorrido del evento' });
    }
};
