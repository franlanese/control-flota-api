// Para pedidos que no pueden mandar el header Authorization y traen el token como texto
// plano en el cuerpo. Es el caso de navigator.sendBeacon (ver /api/auth/recarga-cierre):
// es lo más confiable para avisar que una página se está cerrando, pero no admite headers.
//
// No valida nada: sólo copia el token al header que espera authMiddleware, que va a
// continuación y hace la verificación de siempre. Así hay una sola lógica de validación.
// Necesita que antes corra express.text() para que req.body llegue como string.
module.exports = (req, res, next) => {
    if (typeof req.body === 'string' && req.body.trim()) {
        req.headers['authorization'] = `Bearer ${req.body.trim()}`;
    }
    next();
};
