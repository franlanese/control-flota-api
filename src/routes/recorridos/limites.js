// Límites de la pantalla Recorridos, configurables en el .env del API (docs/decisions/0003).
// Los lee lista.js para aplicarlos y los expone GET /api/recorridos/limites para que el front
// valide el formulario y arme los avisos con los mismos valores: una sola fuente de verdad.
const enteroPositivo = (valor, porDefecto) => {
    const n = parseInt(valor, 10);
    return Number.isInteger(n) && n > 0 ? n : porDefecto;
};

// Se leen en cada llamada (no al cargar el módulo) por si la pantalla Config actualiza
// process.env en caliente, como hace con las demás CONF_*.
const obtenerLimites = () => ({
    maxHoras: enteroPositivo(process.env.CONF_RECORRIDO_MAX_HORAS, 24),
    maxPosiciones: enteroPositivo(process.env.CONF_RECORRIDO_MAX_POSICIONES, 2000),
});

// GET /api/recorridos/limites
const handler = (req, res) => res.json({ success: true, data: obtenerLimites() });

module.exports = handler;
module.exports.obtenerLimites = obtenerLimites;
