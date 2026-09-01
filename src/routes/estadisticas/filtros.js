const { poolPromise } = require('../../../db');

// Réplica de EstadisticasController@index (Laravel): las listas de móviles/zonas que llenan los
// combos "de un Móvil"/"de una Zona" del formulario. Ver CFR_Estadisticas_Filtros (nuevo).
module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('dbo.CFR_Estadisticas_Filtros');

        res.json({
            success: true,
            data: {
                moviles: result.recordsets[0],
                zonas: result.recordsets[1]
            }
        });
    } catch (err) {
        console.error('Error en estadisticas/filtros: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener los filtros' });
    }
};
