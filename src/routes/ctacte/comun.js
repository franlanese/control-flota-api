// Entero que entra en un INT de SQL Server, venga como número o como texto.
const esEntero = v => /^-?\d+$/.test(String(v ?? '').trim()) && Math.abs(Number(v)) <= 2147483647;

const esDuplicado = err => err.number === 2627 || err.number === 2601;

// Validación de CtacteController (store y update). Devuelve el mensaje de error, o null si está bien.
function validarCuenta({ nombre, limite_saldo: limite, porcentaje }) {
    const nom = String(nombre ?? '').trim();
    if (!nom) return 'El Nombre es obligatorio';
    if (nom.length > 60) return 'El Nombre no puede tener más de 60 caracteres';
    if (limite !== null && limite !== undefined && String(limite).trim() !== '' && !esEntero(limite)) {
        return 'Límite de Saldo debe ser un número';
    }
    if (!esEntero(porcentaje) || Number(porcentaje) < 0 || Number(porcentaje) > 100) {
        return 'El Porcentaje debe ser un número entre 0 y 100';
    }
    return null;
}

const limiteONull = v => (v === null || v === undefined || String(v).trim() === '' ? null : Number(v));

module.exports = { esEntero, esDuplicado, validarCuenta, limiteONull };
