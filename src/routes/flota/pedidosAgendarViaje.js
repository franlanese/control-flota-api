const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const user = req.user || {};
        const userId = user.userId !== undefined ? parseInt(user.userId, 10) : 1;
        let nroFlota = user.nro_flota !== undefined && user.nro_flota !== null ? parseInt(user.nro_flota, 10) : 0;

        const ctacte = body.nro_ctacte !== undefined && body.nro_ctacte !== null && body.nro_ctacte !== '' ? parseInt(body.nro_ctacte, 10) : 0;
        const subcta = body.nro_subcta !== undefined && body.nro_subcta !== null && body.nro_subcta !== '' ? parseInt(body.nro_subcta, 10) : 0;

        // Si viene un nro_flota específico de la Cuenta Corriente
        if (body.NroFlota !== undefined && body.NroFlota !== null && body.NroFlota !== '') {
            nroFlota = parseInt(body.NroFlota, 10);
        }

        const tieneCtaCte = ctacte !== 0;
        const pool = await poolPromise;
        let result;

        if ((nroFlota >= 100 && nroFlota <= 200) || tieneCtaCte) {
            let kmEstimados = parseFloat(body.km_estimados);
            if (parseInt(body.ida_vuelta, 10) === 1 && !isNaN(kmEstimados)) {
                kmEstimados *= 2;
            }

            const request = pool.request()
                .input('IdCliente', sql.Int, parseInt(body.nro_cliente, 10) || 0)
                .input('IndLunes', sql.Int, parseInt(body.indlunes, 10) || 0)
                .input('IndMartes', sql.Int, parseInt(body.indmartes, 10) || 0)
                .input('IndMiercoles', sql.Int, parseInt(body.indmiercoles, 10) || 0)
                .input('IndJueves', sql.Int, parseInt(body.indjueves, 10) || 0)
                .input('IndViernes', sql.Int, parseInt(body.indviernes, 10) || 0)
                .input('IndSabado', sql.Int, parseInt(body.indsabado, 10) || 0)
                .input('IndDomingo', sql.Int, parseInt(body.inddomingo, 10) || 0)
                .input('IdModoAgenda', sql.Int, parseInt(body.modoagenda, 10) || 1)
                .input('HoraViaje', sql.VarChar(50), String(body.horaViaje || ''))
                .input('FechaIniVigencia', sql.VarChar(50), String(body.fechaIniVigencia || ''))
                .input('FechaFinVigencia', sql.VarChar(50), String(body.fechaFinvigencia || ''))
                .input('IdCalle', sql.Int, parseInt(body.cod_calle, 10) || 0)
                .input('NombreCalle', sql.VarChar(150), String(body.nombre_calle || ''))
                .input('NroPuerta', sql.Int, -10)
                .input('NroPuertaWeb', sql.VarChar(50), String(body.nro_puerta || ''))
                .input('Ubicacion', sql.VarChar(250), String(body.ubicacion || ''))
                .input('IdCalle1', sql.Int, parseInt(body.cod_calle1, 10) || 0)
                .input('NombreCalle1', sql.VarChar(150), String(body.nombre_calle1 || ''))
                .input('IdCalle2', sql.Int, parseInt(body.cod_calle2, 10) || 0)
                .input('NombreCalle2', sql.VarChar(150), String(body.nombre_calle2 || ''))
                .input('NroTelefono', sql.VarChar(50), String(body.telefono || ''))
                .input('NombrePasajero', sql.VarChar(150), String(body.nombre_pasajero || ''))
                .input('Comentarios', sql.VarChar(sql.MAX), String(body.comentarios || ''))
                .input('IdMovilReq', sql.Int, parseInt(body.id_movil_req, 10) || 0)
                .input('NumeroUsuarioTelefonista', sql.Int, userId)
                .input('Latitud', sql.Real, parseFloat(body.latitud) || 0)
                .input('Longitud', sql.Real, parseFloat(body.longitud) || 0)
                .input('Localidad', sql.VarChar(150), String(body.localidad || ''))
                .input('CodLocalidad', sql.Int, parseInt(body.cod_localidad, 10) || null)
                .input('CantidadViajes', sql.Int, parseInt(body.cantidad, 10) || 1)
                .input('Aire', sql.VarChar(5), String(body.aire || 'False'))
                .input('Baul', sql.VarChar(5), String(body.baul || 'False'))
                .input('Grande', sql.VarChar(5), String(body.grande || 'False'))
                .input('Pos', sql.VarChar(5), String(body.pos || 'False'))
                .input('Vale', sql.VarChar(5), String(body.vale || 'False'))
                .input('Mascota', sql.VarChar(5), String(body.mascota || 'False'))
                .input('Distancia', sql.VarChar(50), String(body.distancia || ''))
                .input('Otro', sql.VarChar(200), String(body.otro || ''))
                .input('Observaciones', sql.VarChar(500), String(body.observaciones || ''))
                .input('NroCtaCte', sql.Int, ctacte)
                .input('NroSubCta', sql.Int, subcta)
                .input('NroFlota', sql.Int, nroFlota)
                .input('Compartido', sql.Int, null)
                .input('idaVuelta', sql.Int, body.ida_vuelta !== undefined && body.ida_vuelta !== null && body.ida_vuelta !== '' ? parseInt(body.ida_vuelta, 10) : null)
                .input('Menor', sql.Int, null)
                .input('Tercero', sql.Int, null)
                .input('Panico', sql.Int, null)
                .input('Link', sql.Int, null)
                .input('LatitudDestino', sql.Real, parseFloat(body.latitud_destino) || 0)
                .input('LongitudDestino', sql.Real, parseFloat(body.longitud_destino) || 0)
                .input('DuracionEstimada', sql.VarChar(50), String(body.duracion_estimada || ''))
                .input('KmEstimados', sql.Real, isNaN(kmEstimados) ? null : kmEstimados)
                .input('IdViajeCompartido', sql.Int, 0)
                .input('CalleDestino', sql.VarChar(150), String(body.calle_destino || ''))
                .input('NroDestino', sql.VarChar(50), String(body.nro_destino || ''))
                .input('NroOperador', sql.Int, userId)
                .input('Importe', sql.Real, parseFloat(body.importe) || 0)
                .input('ImporteSalud', sql.Real, parseFloat(body.importe_salud) || 0)
                .input('ImporteTaxi', sql.Real, parseFloat(body.importe_taxi) || 0)
                .input('FormaPago', sql.VarChar(50), body.FormaPago ? String(body.FormaPago) : null);

            result = await request.execute('dbo.NU_ViajeAgendado_Crear3');
        } else {
            const request = pool.request()
                .input('IdCliente', sql.Int, parseInt(body.nro_cliente, 10) || 0)
                .input('IndLunes', sql.Int, parseInt(body.indlunes, 10) || 0)
                .input('IndMartes', sql.Int, parseInt(body.indmartes, 10) || 0)
                .input('IndMiercoles', sql.Int, parseInt(body.indmiercoles, 10) || 0)
                .input('IndJueves', sql.Int, parseInt(body.indjueves, 10) || 0)
                .input('IndViernes', sql.Int, parseInt(body.indviernes, 10) || 0)
                .input('IndSabado', sql.Int, parseInt(body.indsabado, 10) || 0)
                .input('IndDomingo', sql.Int, parseInt(body.inddomingo, 10) || 0)
                .input('IdModoAgenda', sql.Int, parseInt(body.modoagenda, 10) || 1)
                .input('HoraViaje', sql.VarChar(50), String(body.horaViaje || ''))
                .input('FechaIniVigencia', sql.VarChar(50), String(body.fechaIniVigencia || ''))
                .input('FechaFinVigencia', sql.VarChar(50), String(body.fechaFinvigencia || ''))
                .input('IdCalle', sql.Int, parseInt(body.cod_calle, 10) || 0)
                .input('NombreCalle', sql.VarChar(150), String(body.nombre_calle || ''))
                .input('NroPuerta', sql.Int, -10)
                .input('NroPuertaWeb', sql.VarChar(50), String(body.nro_puerta || ''))
                .input('Ubicacion', sql.VarChar(250), String(body.ubicacion || ''))
                .input('IdCalle1', sql.Int, parseInt(body.cod_calle1, 10) || 0)
                .input('NombreCalle1', sql.VarChar(150), String(body.nombre_calle1 || ''))
                .input('IdCalle2', sql.Int, parseInt(body.cod_calle2, 10) || 0)
                .input('NombreCalle2', sql.VarChar(150), String(body.nombre_calle2 || ''))
                .input('NroTelefono', sql.VarChar(50), String(body.telefono || ''))
                .input('NombrePasajero', sql.VarChar(150), String(body.nombre_pasajero || ''))
                .input('Comentarios', sql.VarChar(sql.MAX), String(body.comentarios || ''))
                .input('IdMovilReq', sql.Int, parseInt(body.id_movil_req, 10) || 0)
                .input('ImportePactado', sql.Real, parseFloat(body.importe_pactado) || 0)
                .input('NumeroUsuarioTelefonista', sql.Int, userId)
                .input('Latitud', sql.Real, parseFloat(body.latitud) || 0)
                .input('Longitud', sql.Real, parseFloat(body.longitud) || 0)
                .input('Localidad', sql.VarChar(150), String(body.localidad || ''))
                .input('CodLocalidad', sql.Int, parseInt(body.cod_localidad, 10) || null)
                .input('CantidadViajes', sql.Int, parseInt(body.cantidad, 10) || 1)
                .input('Aire', sql.VarChar(5), String(body.aire || 'False'))
                .input('Baul', sql.VarChar(5), String(body.baul || 'False'))
                .input('Grande', sql.VarChar(5), String(body.grande || 'False'))
                .input('Pos', sql.VarChar(5), String(body.pos || 'False'))
                .input('Vale', sql.VarChar(5), String(body.vale || 'False'))
                .input('Mascota', sql.VarChar(5), String(body.mascota || 'False'))
                .input('Distancia', sql.VarChar(50), String(body.distancia || ''))
                .input('Otro', sql.VarChar(200), String(body.otro || ''))
                .input('Observaciones', sql.VarChar(500), String(body.observaciones || ''))
                .input('NroCtaCte', sql.Int, ctacte)
                .input('NroSubCta', sql.Int, subcta)
                .input('NroFlota', sql.Int, nroFlota);

            result = await request.execute('dbo.NU_ViajeAgendado_Crear1');
        }

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en pedidosAgendarViaje: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al agendar viaje'
        });
    }
};
