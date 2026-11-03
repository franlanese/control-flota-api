// Arma la URL absoluta y pública de un archivo servido por esta API (ej. '/fotos/...').
//
// No alcanza con req.get('host'): es el host por el que entró ESE pedido. Si la foto se
// subió desde desarrollo queda 'localhost:7400', y si el proxy de producción no reenvía
// el Host original también. Esa URL se guarda en la base (CONDUCTORES/TITULARES.URLfoto)
// y la leen los SPs de las apps (VIAJA_*, MF_*), así que tiene que ser la dirección con
// la que se llega al servidor desde afuera.
//
// PUBLIC_URL (en el .env) es esa dirección, sin barra final y sin /api:
//   PUBLIC_URL=http://149.50.131.213:8010
// Si no está seteada se usa el host del pedido, que era el comportamiento anterior.
function urlPublica(req, ruta) {
    const base = (process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
    return `${base}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
}

module.exports = { urlPublica };
