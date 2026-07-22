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

module.exports = { makeUploader, PUBLIC_FOTOS_DIR };
