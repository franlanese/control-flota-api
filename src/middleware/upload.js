const multer = require('multer');
const path = require('path');
const fs = require('fs');

const PUBLIC_FOTOS_DIR = path.join(__dirname, '..', '..', 'public', 'fotos');
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

// Crea un middleware de subida que guarda 1 imagen de perfil por registro en
// public/fotos/<subfolder>/<id>/perfil.<ext>, reemplazando cualquier foto previa.
function makeUploader(subfolder, paramName) {
    const storage = multer.diskStorage({
        destination: (req, _file, cb) => {
            const id = req.params[paramName];
            const dir = path.join(PUBLIC_FOTOS_DIR, subfolder, String(id));
            fs.mkdirSync(dir, { recursive: true });
            for (const f of fs.readdirSync(dir)) {
                if (f.startsWith('perfil')) fs.unlinkSync(path.join(dir, f));
            }
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
            cb(null, `perfil${ext}`);
        },
    });

    return multer({
        storage,
        limits: { fileSize: 4 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            cb(null, ALLOWED_EXT.includes(path.extname(file.originalname).toLowerCase()));
        },
    });
}

// Variante de makeUploader para archivos únicos de la instalación (no hay un id de registro
// del que colgarlos): guarda en public/fotos/<subfolder>/<basename>.<ext>, borrando cualquier
// versión anterior sea cual sea su extensión. Se usa para el logo de la empresa (Config).
function makeFixedUploader(subfolder, basename) {
    const dir = path.join(PUBLIC_FOTOS_DIR, subfolder);

    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => {
            fs.mkdirSync(dir, { recursive: true });
            // Si antes se subió un .png y ahora viene un .jpg, hay que borrar el viejo a mano:
            // multer sólo pisa el archivo si coincide el nombre completo.
            for (const f of fs.readdirSync(dir)) {
                if (f.startsWith(basename + '.')) fs.unlinkSync(path.join(dir, f));
            }
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase() || '.png';
            cb(null, `${basename}${ext}`);
        },
    });

    return multer({
        storage,
        limits: { fileSize: 2 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            cb(null, ALLOWED_EXT.includes(path.extname(file.originalname).toLowerCase()));
        },
    });
}

module.exports = { makeUploader, makeFixedUploader, PUBLIC_FOTOS_DIR, ALLOWED_EXT };
