const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Herramienta "Cargar localidad" (Config → Herramientas). Feature nueva: en Laravel las filas de
// LOCALIDADES se cargaban a mano en SQL. Ver docs/decisions/0017-cargar-localidad.md.
//
// La búsqueda (Google Geocoder + Zippopotam para el CP) ocurre en el navegador (decisión 1B), así
// que acá sólo llega el resultado ya revisado por el operador. El servidor no puede comprobar que
// las coordenadas salieron de Google: lo único que valida es formato y rangos.
//
// La unicidad de cod_localidad (= código postal) la garantiza el SP CFR_Localidades_Crear: chequeo
// e INSERT en la misma transacción con UPDLOCK+HOLDLOCK. Si el código ya existe no graba nada y
// acá se responde 409, para que el operador edite el CP y vuelva a intentar (decisión 3).

const LARGO_NOMBRE = 40; // nombre_largo / nombre_abreviado / pais son varchar(40)

const texto = v => (v === undefined || v === null ? '' : String(v).trim());
const numero = v => (v === '' || v === null || v === undefined ? NaN : Number(v));

function validar(b) {
    const nombreLargo = texto(b.nombre_largo);
    const nombreAbreviado = texto(b.nombre_abreviado) || nombreLargo.slice(0, LARGO_NOMBRE);
    const pais = texto(b.pais) || 'Argentina';
    const codPais = (texto(b.cod_pais) || 'ar').toLowerCase();

    if (!nombreLargo) return { error: 'El nombre de la localidad es obligatorio.' };
    if (nombreLargo.length > LARGO_NOMBRE) return { error: `El nombre no puede superar los ${LARGO_NOMBRE} caracteres.` };
    if (nombreAbreviado.length > LARGO_NOMBRE) return { error: `El nombre abreviado no puede superar los ${LARGO_NOMBRE} caracteres.` };
    if (pais.length > LARGO_NOMBRE) return { error: 'El país no puede superar los 40 caracteres.' };
    if (codPais.length > 3) return { error: 'El código de país no puede superar los 3 caracteres.' };

    // Sólo dígitos: evita que "2107abc" pase como 2107 con parseInt.
    const cod = texto(b.cod_localidad);
    if (!/^\d{1,9}$/.test(cod) || Number(cod) === 0) {
        return { error: 'El código postal tiene que ser un número entero positivo.' };
    }

    const lat = numero(b.latitud_centro), lng = numero(b.longitud_centro);
    const neLat = numero(b.ne_latitud), neLng = numero(b.ne_longitud);
    const soLat = numero(b.so_latitud), soLng = numero(b.so_longitud);
    const lats = [lat, neLat, soLat], lngs = [lng, neLng, soLng];
    if (![...lats, ...lngs].every(Number.isFinite)) {
        return { error: 'Faltan las coordenadas de la localidad. Volvé a buscarla.' };
    }
    if (!lats.every(v => v >= -90 && v <= 90) || !lngs.every(v => v >= -180 && v <= 180)) {
        return { error: 'Las coordenadas están fuera de rango.' };
    }
    // El recuadro tiene que estar "bien orientado" y contener al centro; si no, la validación de
    // direcciones de NuevoPedidoModal (que descarta lo que cae fuera de estos límites) rechazaría todo.
    if (!(neLat >= soLat && neLng >= soLng)) {
        return { error: 'Los límites de la localidad son inválidos (el NE tiene que quedar al norte y al este del SO).' };
    }
    if (!(lat >= soLat && lat <= neLat && lng >= soLng && lng <= neLng)) {
        return { error: 'El centro de la localidad queda fuera de sus límites.' };
    }

    return {
        datos: {
            cod: Number(cod), nombreLargo, nombreAbreviado, pais, codPais,
            lat, lng, neLat, neLng, soLat, soLng,
        },
    };
}

module.exports = async (req, res) => {
    try {
        const { error, datos: d } = validar(req.body || {});
        if (error) return res.status(400).json({ success: false, error });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('CodLocalidad', sql.Int, d.cod)
            .input('NombreLargo', sql.VarChar(40), d.nombreLargo)
            .input('NombreAbreviado', sql.VarChar(40), d.nombreAbreviado)
            .input('LatitudCentro', sql.Real, d.lat)
            .input('LongitudCentro', sql.Real, d.lng)
            .input('LimiteNorteEsteLatitud', sql.Real, d.neLat)
            .input('LimiteNorteEsteLongitud', sql.Real, d.neLng)
            .input('LimiteSurOesteLatitud', sql.Real, d.soLat)
            .input('LimiteSurOesteLongitud', sql.Real, d.soLng)
            .input('Pais', sql.VarChar(40), d.pais)
            .input('CodPais', sql.VarChar(3), d.codPais)
            .execute('CFR_Localidades_Crear');

        const fila = (result.recordset || [])[0] || {};
        if (!fila.creada) {
            const quien = fila.nombre_existente ? ` (lo usa "${fila.nombre_existente}")` : '';
            return res.status(409).json({
                success: false,
                error: `El código postal ${d.cod} ya está en uso${quien}. Editá el código y volvé a intentar.`,
            });
        }

        res.json({ success: true, data: { IdLocalidad: fila.IdLocalidad, cod_localidad: d.cod } });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Localidades_Crear:', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al guardar la localidad' });
    }
};
