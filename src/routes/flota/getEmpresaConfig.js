// Réplica de config('configuracion.EMPRESANOMBRE'/'EMPRESALOGO') que Laravel inyecta en el
// sidebar (resources/views/navbar/navbar2.blade.php) — mismo criterio: valores fijos por
// configuración de entorno, sin ningún cálculo dinámico ni por flota/tenant.
module.exports = async (req, res) => {
    res.json({
        success: true,
        data: {
            nombre: process.env.CONF_EMPRESANOMBRE || null,
            logo: process.env.CONF_EMPRESALOGO || null,
            // config('configuracion.CHOFERVIAJA'): la pantalla de flota lo usa para decidir
            // qué importes muestra el cartel de cada viaje (choferViajaFlota en Laravel).
            choferViaja: parseInt(process.env.CONF_CHOFERVIAJA, 10) || 0,
        },
    });
};
