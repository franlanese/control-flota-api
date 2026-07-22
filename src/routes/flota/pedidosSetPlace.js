const { sql, poolPromise } = require('../../../db');
const { randomUUID } = require('crypto');

module.exports = async (req, res) => {
    try {
        const { nombre, nro_puerta, cod_localidad, localidad, latitud, longitud, nombrecalle } = req.body;
        const uuid = randomUUID();

        const pool = await poolPromise;
        await pool.request()
            .input('uuid', sql.VarChar(50), uuid)
            .input('Nombre', sql.VarChar(200), nombre || '')
            .input('NroPuerta', sql.VarChar(20), nro_puerta || '')
            .input('CodLocalidad', sql.Int, parseInt(cod_localidad, 10) || 0)
            .input('Localidad', sql.VarChar(100), localidad || '')
            .input('Latitud', sql.VarChar(30), latitud ? String(latitud) : '')
            .input('Longitud', sql.VarChar(30), longitud ? String(longitud) : '')
            .input('NombreCalle', sql.VarChar(200), nombrecalle || '')
            .execute('dbo.Lugar_CrearModificar');

        res.json({ success: true });
    } catch (err) {
        console.error('Error en setPlace:', err);
        res.status(500).json({ success: false, error: 'Error interno al guardar place' });
    }
};
