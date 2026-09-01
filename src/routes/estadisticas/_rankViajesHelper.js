const { sql, poolPromise } = require('../../../db');

// Compartido por rankViajesMoviles/rankViajesZonas/rankViajesMovilesReq — los tres son el mismo
// SP preexistente NU_RankViajes, solo cambia @Tipo (1=móviles, 2=zonas, 3=móviles requeridos).
module.exports = function makeRankViajesHandler(tipo, { requiereCalle = false } = {}) {
    return async (req, res) => {
        try {
            const body = req.body || {};
            const { desde, hasta, calle } = body;

            if (!desde || !hasta) {
                return res.status(400).json({ success: false, error: 'Debe indicar desde y hasta' });
            }

            const pool = await poolPromise;
            const request = pool.request()
                .input('Tipo', sql.Int, tipo)
                .input('Desde', sql.DateTime, new Date(desde))
                .input('Hasta', sql.DateTime, new Date(hasta));

            if (requiereCalle) {
                request.input('Calle', sql.Int, calle ? 1 : 0);
            }

            const result = await request.execute('dbo.NU_RankViajes');
            res.json({ success: true, data: result.recordset });
        } catch (err) {
            console.error(`Error en estadisticas/rankViajes (Tipo=${tipo}): `, err);
            res.status(500).json({ success: false, error: 'Error interno del servidor al generar la estadística' });
        }
    };
};
