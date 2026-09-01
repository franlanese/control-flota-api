const { sql, poolPromise } = require('../../../db');

// Réplica de AlarmaController@grabarEventoAlarma (Laravel): registra un evento sobre una alarma
// de pánico (CP = "consulté al móvil", CA = "cerré la alarma") vía el SP de negocio existente
// Alarma_Eventos_Grabar (no se toca, es preexistente). Cuando el evento es "CA" (se cierra el
// modal de Pánico) además finaliza la alarma — réplica de terminarAlarma(), que en Laravel eran
// dos UPDATE sueltos; acá se envolvieron en CFR_Alarma_Finalizar (nuevo) para no meter SQL en Node.
module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const user = req.user || {};
        const idAlarma = body.id_alarma;
        const nroMovil = body.nro_movil;
        const codEvento = body.cod_evento;

        if (idAlarma === undefined || idAlarma === null || !codEvento) {
            return res.status(400).json({ success: false, error: 'Parámetros incompletos para grabar el evento de alarma' });
        }

        const idOperador = user.userId !== undefined && user.userId !== null ? parseInt(user.userId, 10) : 0;
        const velocidad = body.velocidad !== undefined && body.velocidad !== null && body.velocidad !== '' ? parseFloat(body.velocidad) : 0;

        const pool = await poolPromise;
        await pool.request()
            .input('IdAlarma', sql.Int, idAlarma)
            .input('FechaHora', sql.DateTime, new Date())
            .input('CodEvento', sql.VarChar(10), String(codEvento))
            .input('IdOperador', sql.Int, idOperador)
            .input('Latitud', sql.VarChar(50), String(body.lat ?? ''))
            .input('Longitud', sql.VarChar(50), String(body.lng ?? ''))
            .input('Velocidad', sql.Float, velocidad)
            .input('Rumbo', sql.VarChar(20), String(body.rumbo ?? ''))
            .input('EstadoOperativo', sql.VarChar(5), String(body.estado_operativo ?? ''))
            .input('Nro_movil', sql.Int, nroMovil)
            .execute('dbo.Alarma_Eventos_Grabar');

        if (codEvento === 'CA') {
            await pool.request()
                .input('IdAlarma', sql.Int, idAlarma)
                .input('NroMovil', sql.Int, nroMovil)
                .execute('dbo.CFR_Alarma_Finalizar');
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error en grabarEventoAlarma: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al grabar el evento de alarma' });
    }
};
