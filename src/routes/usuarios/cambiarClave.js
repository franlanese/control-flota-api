const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('../../../db');

// Réplica de Auth\ResetPasswordController@changePassword (POST /cambiar-clave en Laravel).
// El usuario que cambia la clave es SIEMPRE el logueado: se toma de req.user.userId (JWT),
// nunca del body, para que nadie pueda cambiarle la clave a otro por acá.
// Laravel validaba 'current_password' + 'password|confirmed' y, si la actual no coincidía,
// redirigía con error; acá devolvemos 400 con el mismo mensaje.
module.exports = async (req, res) => {
    try {
        const userId = req.user && req.user.userId;
        const { current_password, password, password_confirmation } = req.body || {};

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Sesión inválida.' });
        }
        if (!current_password || !password) {
            return res.status(400).json({ success: false, error: 'La clave actual y la nueva clave son obligatorias.' });
        }
        // 'password' => 'required|confirmed' de Laravel
        if (password_confirmation !== undefined && password !== password_confirmation) {
            return res.status(400).json({ success: false, error: 'Las claves no coinciden.' });
        }
        // Mismo mínimo que usa el ABM de Usuarios (crear.js)
        if (password.length < 3) {
            return res.status(400).json({ success: false, error: 'La nueva clave debe tener al menos 3 caracteres' });
        }
        if (password === current_password) {
            return res.status(400).json({ success: false, error: 'La nueva clave debe ser distinta a la actual.' });
        }

        const pool = await poolPromise;

        // 1. Traer el hash actual (mismo SELECT inline que hace auth/login.js)
        const q = await pool.request()
            .input('UserId', sql.Int, userId)
            .query('SELECT user_id, password FROM NuUsuarios WHERE user_id = @UserId');

        if (q.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
        }

        // 2. Verificar la clave actual — equivalente a Hash::check($request->current_password, ...)
        const claveOk = await bcrypt.compare(current_password, q.recordset[0].password);
        if (!claveOk) {
            return res.status(400).json({ success: false, error: 'La clave actual no es correcta.' });
        }

        // 3. Guardar la nueva hasheada (bcrypt, igual que crear.js/actualizar.js)
        const hash = bcrypt.hashSync(password, 10);
        await pool.request()
            .input('user_id', sql.Int, userId)
            .input('password', sql.VarChar(255), hash)
            .execute('CFR_Usuarios_CambiarClave');

        // El front hace el logout y redirige al login ("Una vez cambiada será redirigido al login")
        res.json({ success: true });
    } catch (err) {
        console.error('Error en CFR_Usuarios_CambiarClave:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
