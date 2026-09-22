const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const { usuario, nombre, password, nivel, nro_puesto } = req.body;

        if (!usuario || !nombre || !password || !nivel) {
            return res.status(400).json({ success: false, error: 'usuario, nombre, password y nivel son obligatorios' });
        }
        if (password.length < 3) {
            return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 3 caracteres' });
        }

        const hash = bcrypt.hashSync(password, 10);

        const pool = await poolPromise;
        await pool.request()
            .input('usuario', sql.VarChar(50), usuario)
            .input('nombre', sql.VarChar(50), nombre)
            .input('password', sql.VarChar(255), hash)
            .input('nivel', sql.Int, parseInt(nivel))
            .input('nro_puesto', sql.Int, nro_puesto ? parseInt(nro_puesto) : null)
            .execute('CFR_Usuarios_Crear');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Usuarios_Crear:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
