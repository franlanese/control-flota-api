const { poolPromise , sql} = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// tipo: 'D' = por día, 'W' = por semana
//
// TODO: pasar de Rep_ViajesTotalesxDia a CFR_ViajesTotalesxDia (una vez creado el SP).
// Rep_ViajesTotalesxDia parte los turnos fijo y distinto según @Tipo (por día siempre de a
// 6 h; por semana 00-06/06-14/14-22/22-24), así que el selector de turnos del Panel de
// Control muestra franjas equivocadas en 2 de las 4 combinaciones. El SP nuevo recibe
// @Horas y devuelve Cant1..Cant4 ya partidas según Config. Pasos:
//   1. importar también `sql` del require de db
//   2. calcular horas: process.env.CONF_6HORAS === '1' ? 6 : 8  (igual que viajesTotales.js)
//   3. reemplazar el .query(...) por:
//        .input('Tipo', sql.VarChar(1), tipo)
//        .input('Horas', sql.TinyInt, horas)
//        .execute('CFR_ViajesTotalesxDia')
//      (el SET DATEFORMAT ya no hace falta: el SP nuevo no parsea fechas de texto)
module.exports = async (req, res) => {
    const tipo = req.query.tipo === 'W' ? 'W' : 'D';
    const horas = process.env.CONF_6HORAS === '1' ? 6 : 8
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Tipo', sql.VarChar(1), tipo)
            .input('Horas', sql.TinyInt, horas)
            .execute(`CFR_ViajesTotalesXDia`);
        res.json({ success: true, data: result.recordset, tipo });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en viajesTotalesPorDia:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
