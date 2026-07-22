const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const nombre = req.query.nombre || '';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('nombre', sql.VarChar(200), nombre)
            .execute('dbo.Lugar_Obtener');

        const places = (result.recordset || []).map(p => ({
            ...p,
            nro_puerta: p.nro_puerta ? String(p.nro_puerta).replace(/&/g, '') : '',
        }));

        res.json(places);
    } catch (err) {
        console.error('Error en getPlaces:', err);
        res.status(500).json({ success: false, error: 'Error interno al buscar places' });
    }
};
