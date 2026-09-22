const { registrarErrorWeb } = require('../../utils/errorWeb');
const bcrypt = require('bcryptjs');

// Herramienta de administración: convierte una clave en texto al hash bcrypt con el mismo formato
// que tienen las claves guardadas en NuUsuarios.password, para poder pegarlo a mano en la base.
// No lee ni escribe la base: sólo calcula.
//
// Formato: todas las claves existentes son '$2y$10$...' (bcrypt de Laravel/PHP, costo 10).
// bcryptjs genera '$2b$'. Para bcrypt, $2b$ y $2y$ son el mismo algoritmo (los dos son la versión
// corregida), así que cambiar el prefijo no altera el hash: se devuelve '$2y$' para que quede igual
// al resto de la tabla y lo pueda verificar tanto Laravel como el login de Node (bcryptjs acepta $2y$).
const COSTO = 10;
// bcrypt sólo usa los primeros 72 BYTES de la clave e ignora el resto en silencio: dos claves que
// empiezan igual y difieren después del byte 72 darían el mismo hash. Mejor rechazarlas.
const MAX_BYTES = 72;

module.exports = async (req, res) => {
    try {
        const clave = req.body ? req.body.clave : undefined;

        if (typeof clave !== 'string' || clave.length === 0) {
            return res.status(400).json({ success: false, error: 'Ingresá la clave a cifrar.' });
        }
        if (Buffer.byteLength(clave, 'utf8') > MAX_BYTES) {
            return res.status(400).json({ success: false, error: `La clave no puede superar los ${MAX_BYTES} bytes (bcrypt ignora lo que sobra).` });
        }

        const hash = (await bcrypt.hash(clave, COSTO)).replace(/^\$2[ab]\$/, '$2y$');

        res.json({ success: true, data: { hash } });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en usuarios/cifrarClave:', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al cifrar la clave' });
    }
};
