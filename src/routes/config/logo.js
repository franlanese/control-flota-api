const { registrarErrorWeb } = require('../../utils/errorWeb');
const { setEnvValues } = require('../../utils/envFile');

// Sube el logo de la empresa y lo deja servido localmente por esta misma API, en vez de
// depender de una URL externa (hasta ahora CONF_EMPRESALOGO apuntaba a endata.com.ar).
// El archivo queda en public/fotos/empresa/logo.<ext>, que ya está publicado por el
// express.static('/fotos') de index.js — no hace falta montar nada nuevo.
//
// Igual que el resto de la pantalla de Config, el valor no va a la base: se escribe
// CONF_EMPRESALOGO en el .env (y en process.env en caliente) vía setEnvValues.
module.exports = async (req, res) => {
    try {
        if (!req.file) {
            // Cae acá tanto si no se mandó archivo como si el fileFilter de multer lo rechazó
            // por extensión no permitida (jpg/jpeg/png/gif/svg).
            return res.status(400).json({
                success: false,
                error: 'No se recibió una imagen válida (formatos permitidos: jpg, jpeg, png, gif, svg).'
            });
        }

        // El ?v=<timestamp> es para romper la caché del navegador: el archivo siempre se llama
        // igual, así que sin esto el sidebar seguiría mostrando el logo anterior hasta un
        // hard-refresh. express.static ignora el query string, así que el archivo se sirve igual.
        //
        // Se guarda la ruta RELATIVA, sin host: el front le antepone el origen del API
        // (resolverUrlApi en control-flota-react/src/utils/apiUrl.ts). Antes se armaba con
        // req.get('host'), y si el logo se subía desde desarrollo quedaba 'localhost:7400'
        // grabado y producción se lo mandaba a todos los navegadores.
        const version = Date.now();
        const url = `/fotos/empresa/${req.file.filename}?v=${version}`;

        setEnvValues({ CONF_EMPRESALOGO: url });

        res.json({ success: true, data: { url } });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en config/logo: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al subir el logo' });
    }
};
