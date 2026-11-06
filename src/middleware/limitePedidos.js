// Límite de pedidos por usuario para una ruta (docs/decisions/0006-reporte-avl-estados-y-reporta.md,
// decisión 5). Ejemplo:
//
//     router.get('/', requierePermiso('WebHistoricos'), limitePedidos({ max: 30, ventanaMs: 60000 }), require('./lista'));
//
// - Cuenta por req.user.userId (lo completa authMiddleware), NO por IP: los operadores de una
//   misma base pueden salir a internet por la misma IP pública y compartirían el límite.
//   Por eso tiene que ir después de authMiddleware.
// - Ventana deslizante: guarda los instantes de los últimos pedidos de cada usuario, así el
//   máximo vale para CUALQUIER período de ventanaMs (con una ventana fija se podían hacer el
//   doble de pedidos juntando el final de una ventana con el principio de la siguiente).
// - Vive en la memoria del proceso: ~10-30 KB para 100 usuarios. Se reinicia con el proceso, y
//   con varias instancias (PM2 en modo cluster) cada una lleva su propia cuenta.
// - Cada llamada a limitePedidos() crea su propio contador: dos rutas con limitePedidos(...)
//   no comparten la cuenta.
function limitePedidos({ max, ventanaMs }) {
    // userId -> instantes (ms) de los pedidos aceptados dentro de la ventana, del más viejo al más nuevo
    const pedidos = new Map();

    // Limpieza periódica: borra a los usuarios sin pedidos recientes para que el Map no crezca.
    // unref() hace que este timer no impida que el proceso termine.
    setInterval(() => {
        const limite = Date.now() - ventanaMs;
        for (const [userId, instantes] of pedidos) {
            if (instantes[instantes.length - 1] <= limite) pedidos.delete(userId);
        }
    }, ventanaMs).unref();

    return (req, res, next) => {
        const userId = req.user && req.user.userId;
        if (userId == null) return next();   // sin usuario no hay a quién contarle (no debería pasar detrás de authMiddleware)

        const ahora = Date.now();
        const recientes = (pedidos.get(userId) || []).filter(t => t > ahora - ventanaMs);

        if (recientes.length >= max) {
            // Se libera un lugar cuando el pedido más viejo de la ventana sale de ella.
            const reintentarEn = Math.max(1, Math.ceil((recientes[0] + ventanaMs - ahora) / 1000));
            pedidos.set(userId, recientes);
            // Retry-After es el header estándar; el valor va también en el JSON porque la
            // configuración de CORS no expone ese header al navegador.
            res.set('Retry-After', String(reintentarEn));
            return res.status(429).json({
                success: false,
                error: `Demasiados pedidos. Reintente en ${reintentarEn} s.`,
                reintentarEn,
            });
        }

        recientes.push(ahora);
        pedidos.set(userId, recientes);
        next();
    };
}

module.exports = { limitePedidos };
