const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Número -> nombre de cada usuario, para que Históricos muestre el nombre del telefonista en vez
// del número que devuelve VIAJA_ViajesFiltrados_Tildes3 (SP fijo, no se toca). La traducción la
// hace el front: ver docs/decisions/0010-nombre-telefonista-historicos.md.
module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('dbo.CFR_Historicos_Telefonistas');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en historicos/telefonistas:', err);
        res.status(500).json({ success: false, error: 'Error al obtener los telefonistas' });
    }
};
