// Bloqueo en memoria para operaciones de dinero (docs/decisions/0004, decisión 3): evita dos
// pedidos simultáneos sobre lo mismo (doble clic, otra pestaña, otro operador).
//
// `add` va antes de cualquier await: entre el `has` y el `add` no se cede el control, así que
// otro pedido no puede colarse. `finally` libera la clave aunque el servicio falle.
//
// Límites conocidos: se pierde al reiniciar el API, no sirve con varios procesos, y no impide
// repetir la operación una vez terminada la primera.
const enCurso = new Set();

async function conBloqueo(clave, res, operacion) {
    if (enCurso.has(clave)) {
        return res.status(409).json({ success: false, error: 'Esa operación ya se está procesando. Espere a que termine.' });
    }
    enCurso.add(clave);
    try {
        return await operacion();
    } finally {
        enCurso.delete(clave);
    }
}

module.exports = { conBloqueo };
