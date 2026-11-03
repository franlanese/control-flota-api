const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Puestos para el combo del login. Igual que Laravel (auth/login.blade.php, que sólo lo
// dibuja con config('configuracion.IVR') != 0): el puesto se elige únicamente cuando la
// telefonía es IVR. Con "Sin Telefonía" o USB se devuelve la lista vacía y el login no
// muestra el combo; el usuario entra con puesto 0.
// Mismo criterio que paneldecontrol/getConfig.js para leer CONF_IVR. El valor se toma de
// process.env en cada pedido, así que un cambio hecho desde la pantalla de Config se aplica
// sin reiniciar el API.
const usaPuestos = () => process.env.CONF_IVR != null && process.env.CONF_IVR !== '0';

module.exports = async (req, res) => {
    try {
        if (!usaPuestos()) {
            return res.json({ success: true, usaPuestos: false, data: [] });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT id_puesto, descripcion, telefono FROM NU_PUESTOS ORDER BY id_puesto ASC');

        res.json({
            success: true,
            usaPuestos: true,
            data: result.recordset
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en getPuestos: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener la lista de puestos'
        });
    }
};

module.exports.usaPuestos = usaPuestos;
