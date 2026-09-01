// Réplica de las variables mapaLat/mapaLng/mapaZoom que Laravel inyecta al mapaleaf
// desde config('configuracion.MAPLAT'/'MAPLNG'/'MAPZOOM') — mismo criterio: centro y
// zoom fijos por configuración, sin ningún cálculo dinámico.
module.exports = async (req, res) => {
    res.json({
        success: true,
        data: {
            lat: parseFloat(process.env.CONF_MAPLAT),
            lng: parseFloat(process.env.CONF_MAPLNG),
            zoom: parseFloat(process.env.CONF_MAPZOOM),
        },
    });
};
