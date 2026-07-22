const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Obtener la cabecera de Authorization
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <token>

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Acceso no autorizado. Token faltante.'
        });
    }

    try {
        // 2. Verificar la validez del token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'control_flota_secret_key_2026');
        
        // 3. Inyectar la información del usuario decodificado en req
        req.user = decoded; // { userId, usuario, nro_flota, nro_mesas, nro_puesto, permisos }
        
        next();
    } catch (err) {
        console.error('Error al verificar JWT:', err.message);
        return res.status(403).json({
            success: false,
            error: 'Token inválido o expirado'
        });
    }
};
