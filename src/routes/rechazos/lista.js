const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de RechazosController@getTabla (Laravel, raw SQL) — ver CFR_Rechazos_Lista (nuevo).
// Los filtros por móvil/conductor/viaje llegan como dos parámetros separados (uno INT, uno
// VARCHAR) para no necesitar CAST/TRY_CAST dentro del SP (older compat level en este server).
//
// Mejora deliberada respecto a Laravel: el "hasta" ahí se manda tal cual (medianoche del día
// elegido) y la condición es "< hasta", así que en la práctica el propio día "hasta" queda
// afuera de la búsqueda. Acá "hasta" se lleva a las 23:59:59 de ese día para que el rango sea
// el que el usuario espera (incluye el día completo).
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const { fecha_desde, fecha_hasta, tipo, parametro } = body;

        if (!fecha_desde || !fecha_hasta) {
            return res.status(400).json({ success: false, error: 'Debe indicar fecha_desde y fecha_hasta' });
        }

        const desde = new Date(fecha_desde);
        const hasta = new Date(fecha_hasta);
        hasta.setHours(23, 59, 59, 999);

        const tipoNum = tipo !== undefined && tipo !== null ? parseInt(tipo, 10) : 0;
        const parametroLimpio = parametro !== undefined && parametro !== null && String(parametro).trim() !== '' ? String(parametro).trim() : null;

        const parametroMovil = tipoNum === 1 && parametroLimpio !== null ? parseInt(parametroLimpio, 10) : null;
        const parametroTexto = (tipoNum === 2 || tipoNum === 3) ? parametroLimpio : null;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('FechaDesde', sql.DateTime, desde)
            .input('FechaHasta', sql.DateTime, hasta)
            .input('Tipo', sql.Int, tipoNum)
            .input('ParametroMovil', sql.Int, parametroMovil)
            .input('ParametroTexto', sql.VarChar(50), parametroTexto)
            .execute('dbo.CFR_Rechazos_Lista');

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en rechazos/lista: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener los rechazos' });
    }
};
