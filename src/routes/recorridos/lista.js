const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { obtenerLimites } = require('./limites');

// Recorrido de un móvil en un rango de fechas — réplica de RecorridosController@getRecorridos.
// GET /api/recorridos?nro_movil=816&desde=2026-10-20T09:00&hasta=2026-10-20T10:00
//
// Las fechas llegan como las arma un <input type="datetime-local"> ('YYYY-MM-DDTHH:mm', hora
// local) y se le pasan al SP como TEXTO, no como sql.DateTime: db.js usa useUTC: false y un
// Date de JavaScript se correría de zona horaria (el mismo problema que tuvo Feriados). El
// formato ISO con 'T' SQL Server lo convierte a DATETIME igual con cualquier DATEFORMAT.
const FECHA_HORA_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
const conSegundos = f => (f.length === 16 ? `${f}:00` : f);

// 'YYYY-MM-DDTHH:mm:ss' <-> milisegundos, tratando el texto como hora de reloj SIN zona horaria
// (se usa UTC sólo como aritmética): sirve para medir el rango y restarle horas sin que el
// desfase local cambie nada. El resultado vuelve a ser texto para el SP.
const aMs = f => {
    const [fecha, hora] = f.split('T');
    const [a, m, d] = fecha.split('-').map(Number);
    const [h, mi, se] = hora.split(':').map(Number);
    return Date.UTC(a, m - 1, d, h, mi, se || 0);
};
const aTexto = ms => new Date(ms).toISOString().slice(0, 19);

module.exports = async (req, res) => {
    try {
        const nroMovil = parseInt(req.query.nro_movil, 10);
        const { desde, hasta } = req.query;

        if (!Number.isInteger(nroMovil) || nroMovil <= 0) {
            return res.status(400).json({ success: false, error: 'Ingrese un número de móvil válido' });
        }
        if (!FECHA_HORA_RE.test(desde || '') || !FECHA_HORA_RE.test(hasta || '')) {
            return res.status(400).json({ success: false, error: 'Las fechas desde y hasta son obligatorias' });
        }

        const limites = obtenerLimites();
        const hastaTxt = conSegundos(hasta);
        let desdeTxt = conSegundos(desde);

        // Rango mayor al máximo: no es un error, se usan las últimas N horas del rango pedido
        // (las más cercanas al "hasta") y se avisa. Decisión 3 de docs/decisions/0003.
        const rangoRecortado = aMs(hastaTxt) - aMs(desdeTxt) > limites.maxHoras * 3600 * 1000;
        if (rangoRecortado) desdeTxt = aTexto(aMs(hastaTxt) - limites.maxHoras * 3600 * 1000);

        const pool = await poolPromise;
        const result = await pool.request()
            .input('NroMovil', sql.Int, nroMovil)
            .input('Desde', sql.VarChar(19), desdeTxt)
            .input('Hasta', sql.VarChar(19), hastaTxt)
            .input('MaxPosiciones', sql.Int, limites.maxPosiciones)
            .execute('CFR_Recorridos_PorMovil');

        // El SP devuelve hasta maxPosiciones + 1 filas, de la más vieja a la más nueva. Si vino
        // la de más, hubo recorte: se descarta la más vieja y quedan las maxPosiciones más recientes.
        let posiciones = result.recordset || [];
        const posicionesRecortadas = posiciones.length > limites.maxPosiciones;
        if (posicionesRecortadas) posiciones = posiciones.slice(posiciones.length - limites.maxPosiciones);

        res.json({
            success: true,
            data: posiciones,
            recortado: { rango: rangoRecortado, posiciones: posicionesRecortadas },
            desdeAplicado: desdeTxt.slice(0, 16),   // 'YYYY-MM-DDTHH:mm', mismo formato que el campo
            limites,
        });
    } catch (err) {
        // El SP marca "el móvil no existe" con el estado 10 del RAISERROR: es un error del
        // usuario (404), no del servidor. Mismo criterio que Laravel ('movil_no_existe').
        const estado = err.originalError && err.originalError.info && err.originalError.info.state;
        if (estado === 10) {
            return res.status(404).json({ success: false, error: err.message });
        }
        // Fechas invertidas: también es un dato mal cargado, no una falla del servidor.
        if (/fecha hasta no puede ser anterior/i.test(err.message)) {
            return res.status(400).json({ success: false, error: err.message });
        }
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Recorridos_PorMovil:', err);
        res.status(500).json({ success: false, error: 'No se pudo realizar la búsqueda, vuelva a intentarlo' });
    }
};
