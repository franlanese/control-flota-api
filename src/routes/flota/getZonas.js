const express = require('express');
const router = express.Router();
// Importamos la conexión a la base de datos (subiendo dos niveles)
const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Endpoint GET para obtener las zonas
module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;

        // 1. Ejecutamos el Stored Procedure existente
        const result = await pool.request()
            .execute('dbo.NU_ZONASCOUNT');

        // 2. Mapeamos los resultados tal cual lo hacía Laravel en el foreach
        const mappedZonas = result.recordset.map(z => ({
            Id: z.zonasCount, // Mapeamos 'zonasCount' a 'Id'
            movilescount: z.movilescount,
            movilesfuturoscount: z.movilesfuturoscount,
            movilesbasecount: z.movilesbasecount,
            descripcion: z.descripcion,
            moviles: z.moviles,
            movilesfuturos: z.movilesfuturos,
            movilesbase: z.movilesbase
        }));

        // 3. Enviamos los datos limpios en formato JSON
        res.json({
            success: true,
            data: mappedZonas
        });

    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error al obtener zonas en /api/flota/zonas: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener las zonas'
        });
    }
};
