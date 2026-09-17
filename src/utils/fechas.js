// Fecha/hora de una suspensión (Conductores y Móviles) → JS Date en hora LOCAL, para pasar a
// sql.DateTime. Acepta:
//   - el value de <input type="datetime-local">: '2026-06-30T14:30' (lo que manda el front hoy)
//   - el formato de texto anterior, 'dd/mm/aaaa HH:mm', que era el que usaba Laravel
// Se arma con el constructor local de Date y no con new Date(str) a propósito: con useUTC: false
// en db.js, mssql manda los componentes locales tal cual, así que 14:30 en el form = 14:30 en la BD.
function parseFechaSuspension(str) {
    if (!str || !String(str).trim()) return null;
    const s = String(str).trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (m) {
        const [, y, mo, d, h, min] = m;
        return new Date(+y, +mo - 1, +d, +h, +min);
    }
    m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    if (m) {
        const [, d, mo, y, h, min] = m;
        return new Date(+y, +mo - 1, +d, +h, +min);
    }
    return null;
}

module.exports = { parseFechaSuspension };
