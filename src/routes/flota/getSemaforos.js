const { sql, poolPromise } = require('../../../db');

// Caché en memoria para los semáforos
let semaforosCache = {
    success: true,
    data: [],
    fromCache: true,
    timestamp: null
};

// Función para consultar la base de datos y actualizar la caché
async function updateSemaforosCache() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .execute('dbo.Rep_semaforos');

        semaforosCache = {
            success: true,
            data: result.recordset,
            fromCache: true,
            timestamp: new Date().toISOString()
        };
    } catch (err) {
        console.error('Error actualizando caché de semáforos: ', err);
    }
}

// Iniciar el polling centralizado en el backend (ejecutar cada 8 segundos)
updateSemaforosCache();
setInterval(updateSemaforosCache, 8000);

module.exports = async (req, res) => {
    // Retornamos la caché inmediatamente sin realizar consultas directas a SQL
    res.json(semaforosCache);
};
