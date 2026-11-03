// Chequeo de arranque: lista las rutas que no declaran permiso (docs/decisions/0002-permisos-en-el-api.md,
// decisión 1). Con permisos declarados por ruta, un endpoint nuevo al que se le olvide la
// declaración queda abierto a cualquier usuario logueado sin que nada avise; esto lo hace visible
// en la consola cada vez que arranca el API.
//
// Una ruta cuenta como declarada si en su cadena de middlewares hay un requierePermiso(...),
// soloLogin o publica (middleware/permisos.js). Recibe los montajes [prefijo, router] que arma
// index.js porque Express 5 no guarda la ruta de montaje como texto.
function verificarPermisosRutas(montajes) {
    const sinDeclarar = [];
    let total = 0;

    for (const [prefijo, router] of montajes) {
        for (const capa of router.stack || []) {
            if (!capa.route) continue;   // middlewares del router, no rutas
            total++;
            const declarada = capa.route.stack.some(c => c.handle && (c.handle._permisos || c.handle._soloLogin || c.handle._publica));
            if (!declarada) {
                const metodos = Object.keys(capa.route.methods).map(m => m.toUpperCase()).join(',');
                sinDeclarar.push(`${metodos.padEnd(6)} ${prefijo}${capa.route.path}`);
            }
        }
    }

    if (sinDeclarar.length === 0) {
        console.log(`Permisos: las ${total} rutas declaran permiso.`);
        return;
    }
    console.warn(`\n⚠  Permisos: ${sinDeclarar.length} de ${total} rutas NO declaran permiso. ` +
        'Cualquier usuario logueado puede usarlas. Agregar requierePermiso(...) o soloLogin:');
    sinDeclarar.forEach(r => console.warn('     ' + r));
    console.warn('');
}

module.exports = { verificarPermisosRutas };
