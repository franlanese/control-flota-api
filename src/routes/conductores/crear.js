const { poolPromise, sql } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const {
            nro_conductor, nombre, nro_movil, nro_telefono, nro_documento,
            clave_conductor, cuil, nro_licencia, fecha_nacimiento, Sexo, pos, imei,
        } = req.body;

        if (!nro_conductor) {
            return res.status(400).json({ success: false, error: 'nro_conductor es obligatorio' });
        }
        if (imei && imei.length === 15 && !nro_movil) {
            return res.status(400).json({ success: false, error: 'Si coloca IMEI debe colocar también nro de móvil' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('nro_conductor', sql.Int, parseInt(nro_conductor))
            .input('nombre', sql.VarChar(50), nombre || '')
            .input('nro_movil', sql.Int, nro_movil ? parseInt(nro_movil) : null)
            .input('nro_telefono', sql.VarChar(20), nro_telefono || '')
            .input('nro_documento', sql.VarChar(20), nro_documento || '')
            .input('clave_conductor', sql.VarChar(4), clave_conductor || '')
            .input('cuil', sql.VarChar(15), cuil || '')
            .input('nro_licencia', sql.VarChar(20), nro_licencia || '')
            .input('fecha_nacimiento', sql.Date, fecha_nacimiento || null)
            .input('Sexo', sql.Char(1), Sexo || null)
            .input('pos', sql.VarChar(1), pos ? 'S' : 'N')
            .input('imei', sql.VarChar(15), imei || '')
            .execute('CFR_Conductores_Crear');

        res.json({ success: true });
    } catch (err) {
        console.error('Error en CFR_Conductores_Crear:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
