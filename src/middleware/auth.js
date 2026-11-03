const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../../db');

// Verifica la sesión y carga el usuario y sus permisos ACTUALES desde la base, en cada pedido
// (docs/decisions/0002-permisos-en-el-api.md, decisión 2). Igual que Laravel, que resolvía
// User::getPermiso() contra NU_PERMISOS en cada request: si al usuario lo borran o le cambian
// el nivel, el cambio aplica en el pedido siguiente, sin esperar a que venza el token.
//
// Códigos (decisión 3):
//   401 → no hay sesión válida (sin token, token inválido o vencido, usuario borrado).
//         El front manda al login.
//   503 → la base no respondió. NO es 401: si la base cae unos segundos, un 401 desloguearía a
//         todos los operadores conectados; con 503 el front avisa y reintenta sin perder la sesión.
// El 403 (falta de permiso) lo responde requierePermiso, en middleware/permisos.js.
module.exports = async (req, res, next) => {
    // 1. Token del header Authorization: Bearer <token>
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Acceso no autorizado. Token faltante.' });
    }

    // 2. Firma y vencimiento del token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'control_flota_secret_key_2026');
    } catch (err) {
        console.error('Error al verificar JWT:', err.message);
        return res.status(401).json({ success: false, error: 'Sesión inválida o vencida. Vuelva a iniciar sesión.' });
    }

    // 3. Usuario y permisos actuales. El error se captura acá para responder 503: sin el
    //    try/catch, Express 5 lo mandaría a su manejador por defecto (500 en HTML).
    let sesion;
    try {
        const pool = await poolPromise;
        sesion = await pool.request()
            .input('UserId', sql.Int, decoded.userId)
            .execute('CFR_Usuarios_Sesion');
    } catch (err) {
        // No se usa registrarErrorWeb: escribe en la base, que justamente es la que falló.
        console.error('Error al consultar la sesión del usuario (CFR_Usuarios_Sesion):', err.message);
        return res.status(503).json({ success: false, error: 'Servicio no disponible momentáneamente. Reintente en unos segundos.' });
    }

    const usuario = sesion.recordsets[0] && sesion.recordsets[0][0];
    if (!usuario) {
        // El token es válido pero el usuario ya no existe (lo borraron): se corta la sesión.
        return res.status(401).json({ success: false, error: 'El usuario ya no existe. Vuelva a iniciar sesión.' });
    }

    // 4. req.user: identidad, nivel y permisos salen de la base; puesto y mesas siguen saliendo
    //    del token porque son de ESTA sesión (los eligió en el login), no del usuario.
    req.user = {
        ...decoded,
        userId: usuario.user_id,
        usuario: usuario.usuario,
        nombre: usuario.nombre,
        nivel: usuario.nivel,
        nro_flota: usuario.nro_flota,
        permisos: (sesion.recordsets[1] || []).map(p => p.IdFuncion),
    };

    next();
};
