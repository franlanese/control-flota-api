const { sql } = require('../../../db');

// Arma y ejecuta el alta de un viaje agendado, replicando la lógica de
// AgendadosController@modificar en Laravel: flotas 100-200 usan
// NU_ViajeAgendado_Crear3 (cta.cte / ida-vuelta / importes separados),
// el resto usa NU_ViajeAgendado_Crear1 (un solo importe pactado).
async function crearViaje(pool, body, nroOperador) {
    const nroFlota = parseInt(body.nro_flota_original) || 0;
    const usaCrear3 = nroFlota >= 100 && nroFlota <= 200;

    const diasReq = pool.request()
        .input('IdCliente', sql.Int, parseInt(body.nro_cliente) || 0)
        .input('IndLunes', sql.Bit, body.indlunes ? 1 : 0)
        .input('IndMartes', sql.Bit, body.indmartes ? 1 : 0)
        .input('IndMiercoles', sql.Bit, body.indmiercoles ? 1 : 0)
        .input('IndJueves', sql.Bit, body.indjueves ? 1 : 0)
        .input('IndViernes', sql.Bit, body.indviernes ? 1 : 0)
        .input('IndSabado', sql.Bit, body.indsabado ? 1 : 0)
        .input('IndDomingo', sql.Bit, body.inddomingo ? 1 : 0)
        .input('IdModoAgenda', sql.Int, parseInt(body.modoagenda) || 0)
        .input('HoraViaje', sql.VarChar(10), body.horaViaje || '')
        .input('FechaIniVigencia', sql.VarChar(20), body.fechaIniVigencia || '')
        .input('FechaFinVigencia', sql.VarChar(20), body.fechaFinvigencia || '')
        .input('IdCalle', sql.Int, parseInt(body.cod_calle) || 0)
        .input('NombreCalle', sql.VarChar(100), body.nombre_calle || '')
        .input('NroPuerta', sql.Int, -10)
        .input('NroPuertaWeb', sql.VarChar(20), body.nro_puerta || '')
        .input('Ubicacion', sql.VarChar(200), body.ubicacion || '')
        .input('IdCalle1', sql.Int, parseInt(body.cod_calle1) || 0)
        .input('NombreCalle1', sql.VarChar(100), body.nombre_calle1 || '')
        .input('IdCalle2', sql.Int, parseInt(body.cod_calle2) || 0)
        .input('NombreCalle2', sql.VarChar(100), body.nombre_calle2 || '')
        .input('NroTelefono', sql.VarChar(20), (body.telefono || '').trim())
        .input('NombrePasajero', sql.VarChar(100), body.nombre_pasajero || '')
        .input('Comentarios', sql.VarChar(200), body.comentarios || '')
        .input('IdMovilReq', sql.Int, parseInt(body.id_movil_req) || 0)
        .input('NumeroUsuarioTelefonista', sql.Int, nroOperador)
        .input('Latitud', sql.Float, parseFloat(body.latitud) || 0)
        .input('Longitud', sql.Float, parseFloat(body.longitud) || 0)
        .input('Localidad', sql.VarChar(60), body.localidad || '')
        .input('CodLocalidad', sql.Int, parseInt(body.cod_localidad) || 0)
        .input('CantidadViajes', sql.Int, parseInt(body.cantidad) || 1)
        .input('Aire', sql.Char(1), body.aire || 'N')
        .input('Baul', sql.Char(1), body.baul || 'N')
        .input('Grande', sql.Char(1), body.grande || 'N')
        .input('Pos', sql.Char(1), body.pos || 'N')
        .input('Vale', sql.Char(1), body.vale || 'N')
        .input('Mascota', sql.Char(1), body.mascota || 'N')
        .input('Distancia', sql.Char(1), body.distancia || 'N')
        .input('Otro', sql.Char(1), body.otro || 'N')
        .input('Observaciones', sql.VarChar(200), body.observaciones || '')
        .input('CalleDestino', sql.VarChar(100), body.calleDestino || '')
        .input('NroDestino', sql.VarChar(20), body.numeroDestino || '')
        .input('NroOperador', sql.Int, nroOperador);

    const impLimpio = String(body.importeDestino ?? '').replace(/[$ ,]/g, '');
    const importePactado = isNaN(parseFloat(impLimpio)) ? 0 : parseFloat(impLimpio);

    if (usaCrear3) {
        const pactadoLimpio = String(body.pactado_taxi_sp ?? '').replace(/[$ ,]/g, '');
        const importeTaxi = isNaN(parseFloat(pactadoLimpio)) ? 0 : parseFloat(pactadoLimpio);

        await diasReq
            .input('LatitudDestino', sql.Float, parseFloat(body.latDestino) || 0)
            .input('LongitudDestino', sql.Float, parseFloat(body.lngDestino) || 0)
            .input('DuracionEstimada', sql.VarChar(20), body.duracionDestino || '')
            .input('KmEstimados', sql.Float, parseFloat(body.kmDestino) || null)
            .input('NroCtaCte', sql.Int, parseInt(body.nro_ctacte) || 0)
            .input('NroSubCta', sql.Int, parseInt(body.nro_subcta) || 0)
            .input('NroFlota', sql.Int, nroFlota)
            .input('Compartido', sql.Bit, null)
            .input('idaVuelta', sql.Bit, body.ida_vuelta ? 1 : 0)
            .input('Menor', sql.Bit, null)
            .input('Tercero', sql.Bit, null)
            .input('Panico', sql.Bit, null)
            .input('Link', sql.VarChar(200), null)
            .input('IdViajeCompartido', sql.Int, 0)
            .input('ImporteSalud', sql.Decimal(10, 2), importePactado)
            .input('ImporteTaxi', sql.Decimal(10, 2), importeTaxi)
            .input('FormaPago', sql.VarChar(30), body.forma_pago || null)
            .execute('NU_ViajeAgendado_Crear3');
    } else {
        await diasReq
            .input('Idllamada', sql.VarChar(20), body.id_llamada || '')
            .input('NroFlota', sql.Int, nroFlota)
            .input('LatitudDestino', sql.Float, parseFloat(body.latDestino) || null)
            .input('LongitudDestino', sql.Float, parseFloat(body.lngDestino) || null)
            .input('DuracionEstimada', sql.VarChar(20), body.duracionDestino ? String(body.duracionDestino).trim() : null)
            .input('KmEstimados', sql.Float, parseFloat(body.kmDestino) || null)
            .input('ImportePactado', sql.Decimal(10, 2), importePactado)
            .execute('NU_ViajeAgendado_Crear1');
    }
}

module.exports = { crearViaje };
