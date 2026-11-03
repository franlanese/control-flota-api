// IP del cliente que hizo el pedido, para auditoría (login/logout en EVENTOS_OPERADOR).
//
// En producción el API está detrás de nginx, así que la conexión directa siempre viene de
// 127.0.0.1. La IP real llega en el header X-Forwarded-For, y Express sólo lo usa para
// req.ip si se le indica que confíe en el proxy: ver app.set('trust proxy', 'loopback')
// en index.js. Sin eso, todos los logins de producción quedan registrados como loopback.
//
// Node informa las IPv4 como '::ffff:1.2.3.4' cuando escucha en dual-stack; se le saca el
// prefijo para que quede con el mismo formato que venía guardando Laravel ('1.2.3.4').
function ipCliente(req) {
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || '';
    return ip.replace(/^::ffff:/i, '') || 'desconocida';
}

module.exports = { ipCliente };
