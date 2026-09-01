const fs = require('fs');
const path = require('path');

// Réplica de ConfigController@setEnvironmentValue (Laravel): la pantalla de Config no guarda en
// la base de datos, escribe directo el .env del servidor (como hace Laravel con
// app()->environmentFilePath() + Artisan::call("config:clear")). Acá no hay un "config:clear"
// equivalente — en su lugar, además de reescribir el archivo (para que sobreviva un reinicio),
// se pisa `process.env` en caliente para que el cambio aplique inmediatamente sin reiniciar el
// proceso de Node.
const ENV_PATH = path.join(__dirname, '..', '..', '.env');

// updates: { CONF_X: valor, ... }
function setEnvValues(updates) {
    let contenido = fs.readFileSync(ENV_PATH, 'utf8');

    for (const [key, valorCrudo] of Object.entries(updates)) {
        const valor = String(valorCrudo);
        const linea = `${key}=${valor}`;
        const regex = new RegExp(`^${key}=.*$`, 'm');

        if (regex.test(contenido)) {
            contenido = contenido.replace(regex, linea);
        } else {
            if (!contenido.endsWith('\n')) contenido += '\n';
            contenido += `${linea}\n`;
        }

        process.env[key] = valor;
    }

    fs.writeFileSync(ENV_PATH, contenido, 'utf8');
}

module.exports = { setEnvValues, ENV_PATH };
