// Saca navegador, sistema operativo y tipo de dispositivo del header User-Agent, para el
// log de sesiones (CFR_LogsUsuario). No es una librería completa a propósito: cubre los
// navegadores que se usan para operar el sistema, y lo que no reconoce queda en null (el
// User-Agent crudo se guarda igual en su propia columna, así que nada se pierde).
//
// El orden de los chequeos importa: Edge y Opera también dicen "Chrome" en su User-Agent,
// y Chrome también dice "Safari", así que hay que preguntar primero por los más específicos.
function parsearUserAgent(ua) {
    if (!ua) return { navegador: null, sistemaOp: null, dispositivo: null };

    const version = (re) => { const m = ua.match(re); return m ? m[1] : null; };

    let navegador = null;
    let v;
    if ((v = version(/Edg(?:e|A|iOS)?\/(\d+)/)))       navegador = `Edge ${v}`;
    else if ((v = version(/OPR\/(\d+)/)))               navegador = `Opera ${v}`;
    else if ((v = version(/SamsungBrowser\/(\d+)/)))    navegador = `Samsung Internet ${v}`;
    else if ((v = version(/Firefox\/(\d+)/)))           navegador = `Firefox ${v}`;
    else if ((v = version(/(?:Chrome|CriOS)\/(\d+)/)))  navegador = `Chrome ${v}`;
    else if (/Safari\//.test(ua) && (v = version(/Version\/(\d+)/))) navegador = `Safari ${v}`;
    else if ((v = version(/(?:MSIE |rv:)(\d+)/)) && /Trident|MSIE/.test(ua)) navegador = `Internet Explorer ${v}`;

    let sistemaOp = null;
    if (/Windows NT 10\.0/.test(ua))        sistemaOp = 'Windows 10/11'; // el navegador informa lo mismo para los dos
    else if (/Windows NT 6\.3/.test(ua))    sistemaOp = 'Windows 8.1';
    else if (/Windows NT 6\.2/.test(ua))    sistemaOp = 'Windows 8';
    else if (/Windows NT 6\.1/.test(ua))    sistemaOp = 'Windows 7';
    else if (/Windows/.test(ua))            sistemaOp = 'Windows';
    else if ((v = version(/Android (\d+(?:\.\d+)?)/))) sistemaOp = `Android ${v}`;
    else if (/Android/.test(ua))            sistemaOp = 'Android';
    else if ((v = version(/(?:iPhone|CPU) OS (\d+)[_\d]* like Mac OS X/))) sistemaOp = `iOS ${v}`;
    else if (/Mac OS X/.test(ua))           sistemaOp = 'macOS';
    else if (/CrOS/.test(ua))               sistemaOp = 'ChromeOS';
    else if (/Linux/.test(ua))              sistemaOp = 'Linux';

    let dispositivo = 'Escritorio';
    if (/iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) dispositivo = 'Tablet';
    else if (/Mobi|iPhone|Android/.test(ua)) dispositivo = 'Móvil';

    // Si no se reconoció ni navegador ni sistema (un script, curl, etc.), no se inventa "Escritorio".
    if (!navegador && !sistemaOp) dispositivo = null;

    return { navegador, sistemaOp, dispositivo };
}

module.exports = { parsearUserAgent };
