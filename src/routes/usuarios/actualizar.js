const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const userId = parseInt(req.params.user_id);
        const { usuario, nombre, password, nivel, nro_puesto } = req.body;

        if (!usuario || !nombre || !nivel) {
            return res.status(400).json({ success: false, error: 'usuario, nombre y nivel son obligatorios' });
        }

        // Contraseña vacía = no se cambia (se pasa NULL al SP)
        const hash = password && password.trim() ? bcrypt.hashSync(password.trim(), 10) : null;

        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.Int, userId)
            .input('usuario', sql.VarChar(50), usuario)
            .input('nombre', sql.VarChar(50), nombre)
            .input('password', sql.VarChar(255), hash)
            .input('nivel', sql.Int, parseInt(nivel))
            .input('nro_puesto', sql.Int, nro_puesto ? parseInt(nro_puesto) : null)
            .execute('CFR_Usuarios_Update');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Usuarios_Update:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
