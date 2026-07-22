const { poolPromise, sql } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const { nro_titular, nombre, nro_documento, nro_telefono, nro_cuit, email } = req.body;

        if (!nro_titular || !nombre) {
            return res.status(400).json({ success: false, error: 'nro_titular y nombre son obligatorios' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('nro_titular', sql.Int, parseInt(nro_titular))
            .input('nombre', sql.VarChar(40), nombre)
            .input('nro_documento', sql.VarChar(20), nro_documento || '')
            .input('nro_telefono', sql.VarChar(20), nro_telefono || '')
            .input('nro_cuit', sql.VarChar(15), nro_cuit || '')
            .input('email', sql.VarChar(50), email || '')
            .execute('CFR_Titulares_Crear');

        res.json({ success: true });
    } catch (err) {
        console.error('Error en CFR_Titulares_Crear:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
