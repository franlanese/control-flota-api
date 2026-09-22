const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const nroTitular = parseInt(req.params.nro_titular);
        const { nombre, nro_documento, nro_telefono, nro_cuit, email } = req.body;

        if (!nombre) {
            return res.status(400).json({ success: false, error: 'El nombre es obligatorio' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('nro_titular', sql.Int, nroTitular)
            .input('nombre', sql.VarChar(40), nombre)
            .input('nro_documento', sql.VarChar(20), nro_documento || '')
            .input('nro_telefono', sql.VarChar(20), nro_telefono || '')
            .input('nro_cuit', sql.VarChar(15), nro_cuit || '')
            .input('email', sql.VarChar(50), email || '')
            .execute('CFR_Titulares_Update');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Titulares_Update:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
