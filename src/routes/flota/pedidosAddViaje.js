const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const user = req.user || {};
        const userId = user.userId !== undefined ? parseInt(user.userId, 10) : 1;
        let nroFlota = user.nro_flota !== undefined && user.nro_flota !== null ? parseInt(user.nro_flota, 10) : 0;

        const ctacte = body.nro_ctacte !== undefined && body.nro_ctacte !== null && body.nro_ctacte !== '' ? parseInt(body.nro_ctacte, 10) : null;
        const subcta = body.nro_subcta !== undefined && body.nro_subcta !== null && body.nro_subcta !== '' ? parseInt(body.nro_subcta, 10) : null;

        // Si viene un nro_flota específico de la Cuenta Corriente
        if (body.NroFlota !== undefined && body.NroFlota !== null && body.NroFlota !== '') {
            nroFlota = parseInt(body.NroFlota, 10);
        }

        const tieneCtaCte = ctacte !== null && ctacte !== 0;
        const pool = await poolPromise;
        let result;

        if ((nroFlota >= 100 && nroFlota <= 200) || tieneCtaCte) {
            // Flujo Pactado (Pactado 3)
            const request = pool.request()
                .input('IdCalle', sql.Int, parseInt(body.cod_calle, 10) || 0)
                .input('NombreCalle', sql.VarChar(150), String(body.nombre_calle || ''))
                .input('NroPuerta', sql.VarChar(50), String(body.numero || ''))
                .input('Ubicacion', sql.VarChar(250), String(body.ubicacion || ''))
                .input('Latitud', sql.Real, parseFloat(body.latitud) || 0)
                .input('Longitud', sql.Real, parseFloat(body.longitud) || 0)
                .input('IDCalle1', sql.Int, parseInt(body.cod_calle1, 10) || 0)
                .input('NombreCalle1', sql.VarChar(150), String(body.nombre_calle1 || ''))
                .input('IdCalle2', sql.Int, parseInt(body.cod_calle2, 10) || 0)
                .input('NombreCalle2', sql.VarChar(150), String(body.nombre_calle2 || ''))
                .input('Comentarios', sql.VarChar(sql.MAX), String(body.comentarios || ''))
                .input('NombrePasajero', sql.VarChar(150), String(body.nombre_pasajero || ''))
                .input('NroMovilPropuesto', sql.Int, 0)
                .input('NroTelefono', sql.BigInt, parseInt(body.telefono, 10) || 0)
                .input('Imei', sql.VarChar(100), String(body.imei || ''))
                .input('CodLocalidad', sql.Int, parseInt(body.cod_localidad, 10) || null)
                .input('Localidad', sql.VarChar(150), String(body.localidad || ''))
                .input('NumeroUsuarioTelefonista', sql.Int, userId)
                .input('CategoriaMovil', sql.VarChar(50), String(body.categoria_movil || ''))
                .input('Destino', sql.VarChar(250), String(body.destino || ''))
                .input('IdaVuelta', sql.Int, parseInt(body.ida_vuelta, 10) || 0)
                .input('Tercero', sql.Int, parseInt(body.tercero, 10) || 0)
                .input('Menor', sql.Int, parseInt(body.menor, 10) || 0)
                .input('Compartido', sql.Int, parseInt(body.compartido, 10) || 0)
                .input('LatitudDestino', sql.Real, parseFloat(body.latitud_destino) || 0)
                .input('LongitudDestino', sql.Real, parseFloat(body.longitud_destino) || 0)
                .input('DuracionEstimada', sql.VarChar(50), String(body.duracion_estimada || ''))
                .input('CalleDestino', sql.VarChar(150), String(body.calle_destino || ''))
                .input('NroDestino', sql.VarChar(50), String(body.nro_destino || ''))
                .input('KmEstimados', sql.Real, parseFloat(body.km_estimados) || null)
                .input('NroFlota', sql.Int, nroFlota)
                .input('Importe', sql.Real, parseFloat(body.importe) || 0)
                .input('ImporteSalud', sql.Real, parseFloat(body.importe_salud) || 0)
                .input('ImporteTaxi', sql.Real, parseFloat(body.importe_taxi) || 0)
                .input('FormaPago', sql.VarChar(50), body.FormaPago ? String(body.FormaPago) : null)
                .input('Aire', sql.VarChar(5), String(body.aire || 'False'))
                .input('Baul', sql.VarChar(5), String(body.baul || 'False'))
                .input('Grande', sql.VarChar(5), String(body.grande || 'False'))
                .input('Pos', sql.VarChar(5), String(body.pos || 'False'))
                .input('Vale', sql.VarChar(5), String(body.vale || 'False'))
                .input('Mascota', sql.VarChar(5), String(body.mascota || 'False'))
                .input('Distancia', sql.VarChar(50), String(body.distancia || ''))
                .input('Otro', sql.VarChar(200), String(body.otro || ''))
                .input('NroCtaCte', sql.Int, ctacte)
                .input('NroSubCta', sql.Int, subcta);

            result = await request.execute('dbo.MF_DelegarViaje_web_pactado3');
        } else {
            // Flujo Convencional
            const request = pool.request()
                .input('IdCalle', sql.Int, parseInt(body.cod_calle, 10) || 0)
                .input('NombreCalle', sql.VarChar(150), String(body.nombre_calle || ''))
                .input('NroPuerta', sql.Int, -10)
                .input('NroPuertaWeb', sql.VarChar(50), String(body.numero || ''))
                .input('Ubicacion', sql.VarChar(250), String(body.ubicacion || ''))
                .input('Latitud', sql.Real, parseFloat(body.latitud) || 0)
                .input('Longitud', sql.Real, parseFloat(body.longitud) || 0)
                .input('IDCalle1', sql.Int, parseInt(body.cod_calle1, 10) || 0)
                .input('NombreCalle1', sql.VarChar(150), String(body.nombre_calle1 || ''))
                .input('IdCalle2', sql.Int, parseInt(body.cod_calle2, 10) || 0)
                .input('NombreCalle2', sql.VarChar(150), String(body.nombre_calle2 || ''))
                .input('Comentarios', sql.VarChar(sql.MAX), String(body.comentarios || ''))
                .input('NombrePasajero', sql.VarChar(150), String(body.nombre_pasajero || ''))
                .input('NroMovilPropuesto', sql.Int, 0)
                .input('Observaciones', sql.VarChar(500), String(body.observaciones || ''))
                .input('NroTelefono', sql.BigInt, parseInt(body.telefono, 10) || 0)
                .input('CodLocalidad', sql.Int, parseInt(body.cod_localidad, 10) || null)
                .input('Localidad', sql.VarChar(150), String(body.localidad || ''))
                .input('NumeroUsuarioTelefonista', sql.Int, userId)
                .input('NroCliente', sql.Int, parseInt(body.nro_cliente, 10) || 0)
                .input('Imei', sql.VarChar(100), '')
                .input('Idllamada', sql.VarChar(100), String(body.id_llamada || ''))
                .input('Aire', sql.VarChar(5), String(body.aire || 'False'))
                .input('Baul', sql.VarChar(5), String(body.baul || 'False'))
                .input('Grande', sql.VarChar(5), String(body.grande || 'False'))
                .input('Pos', sql.VarChar(5), String(body.pos || 'False'))
                .input('Vale', sql.VarChar(5), String(body.vale || 'False'))
                .input('Mascota', sql.VarChar(5), String(body.mascota || 'False'))
                .input('Distancia', sql.VarChar(50), String(body.distancia || ''))
                .input('Otro', sql.VarChar(200), String(body.otro || ''))
                .input('NroCtaCte', sql.Int, ctacte)
                .input('NroSubCta', sql.Int, subcta)
                .input('NroFlota', sql.Int, nroFlota);

            result = await request.execute('dbo.MF_DelegarViaje_web');
        }

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en pedidosAddViaje: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al crear el viaje'
        });
    }
};
