// Control de permisos por endpoint — equivalente al middleware 'permiso:WebXxx' de Laravel
// (app/Http/Middleware/PermisosMiddleware.php). Ver docs/decisions/0002-permisos-en-el-api.md.
//
// Cada ruta declara qué exige, como segundo argumento del router:
//   router.get('/', requierePermiso('WebFeriados'), require('./lista'));
//   router.get('/', soloLogin, require('./lista'));       // alcanza con estar logueado
//   router.post('/login', publica, loginRoute);           // sin sesión (sólo /api/auth)
//
// Las tres funciones van marcadas (propiedades _permisos / _soloLogin / _publica) para que
// verificarPermisosRutas.js pueda listar, al arrancar el API, las rutas que no declararon nada.
// Una ruta sin declaración igual funciona: sólo exige el login que ya pide authMiddleware.

// Pasa si el usuario tiene AL MENOS UNO de los permisos (mismo criterio que Laravel, que
// aceptaba 'permiso:WebHistoricos,WebSalud'). req.user.permisos los completa authMiddleware
// desde la base en cada pedido, así que reflejan el nivel actual del usuario.
function requierePermiso(...permisos) {
    const middleware = (req, res, next) => {
        const propios = (req.user && req.user.permisos) || [];
        if (permisos.some(p => propios.includes(p))) return next();
        // 403 y no 401: la sesión es válida, lo que falta es el permiso. El front no desloguea
        // con un 403 (decisión 3 de 0002).
        return res.status(403).json({ success: false, error: 'No tenés permiso para realizar esta acción.' });
    };
    middleware._permisos = permisos;
    return middleware;
}

// Declaración explícita de "sólo requiere estar logueado" (rutas que en Laravel estaban en un
// grupo con middleware 'auth' sin 'permiso:'). No hace nada: el login ya lo exige authMiddleware.
function soloLogin(req, res, next) { next(); }
soloLogin._soloLogin = true;

// Declaración explícita de ruta pública (sin sesión): login y los combos del formulario de login.
function publica(req, res, next) { next(); }
publica._publica = true;

module.exports = { requierePermiso, soloLogin, publica };
