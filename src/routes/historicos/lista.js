const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de HistoricoController@getTabla (Laravel) — ejecuta el SP de negocio ya existente
// VIAJA_ViajesFiltrados_Tildes3 (no se crea ningún SP nuevo: esta pantalla no tenía SQL
// embebido en Laravel, así que se reutiliza tal cual, sin tocarlo).
//
// Mapeo de tipoBusqueda -> parámetro dinámico del SP (igual que "dato1" en Laravel):
//   1 Móvil, 2 Id Viaje, 3 Dirección, 4 Número de puerta, 5 Teléfono, 6 Telefonista, 7 Conductor
const DYNAMIC_PARAM_BY_TIPO = {
    1: 'nro_movil',
    2: 'nro_viaje',
    3: 'Direccion',
    4: 'numero',
    5: 'telefono',
    6: 'nro_usuario_telefonista',
    7: 'Conductor',
};

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const {
            fechaDesde, fechaHasta,
            tipoBusqueda, valorBusqueda,
            formaPago,
        } = body;

        if (!fechaDesde || !fechaHasta) {
            return res.status(400).json({ success: false, error: 'fechaDesde y fechaHasta son requeridos' });
        }

        let incluirApp = !!body.incluirApp;
        let incluirSalud = !!body.incluirSalud;
        let incluirCredito = !!body.incluirCredito;
        let incluirOperador = !!body.incluirOperador;
        const incluirAnulados = !!body.incluirAnulados;
        let soloAnulados = !!body.soloAnulados;
        let incluirCalle = !!body.incluirCalle;

        const tipo = Number(tipoBusqueda) || 0;
        // Igual que Laravel (HistoricoController.php): buscar por Id de Viaje ignora los
        // demás filtros de inclusión (se busca ese viaje puntual, sea de donde sea).
        if (tipo === 2) {
            incluirApp = incluirSalud = incluirCredito = incluirOperador = incluirCalle = true;
            soloAnulados = false;
        }

        // Valor (si hay) para el único parámetro dinámico que corresponda a este tipoBusqueda —
        // los otros 6 quedan en NULL. Se arma antes de declarar los .input() para no
        // declarar el mismo parámetro dos veces (mssql no lo permite).
        const dynamicParam = DYNAMIC_PARAM_BY_TIPO[tipo];
        const tieneValor = valorBusqueda !== undefined && valorBusqueda !== null && String(valorBusqueda).trim() !== '';
        const valor = tieneValor ? String(valorBusqueda).trim() : null;
        const valorInt = tieneValor ? parseInt(valor, 10) : null;

        const pool = await poolPromise;
        const request = pool.request()
            .input('FechaDesde', sql.DateTime, new Date(fechaDesde))
            .input('FechaHasta', sql.DateTime, new Date(fechaHasta))
            .input('IncluirApp', sql.Bit, incluirApp)
            .input('IncluirSalud', sql.Bit, incluirSalud)
            .input('IncluirCredito', sql.Bit, incluirCredito)
            .input('IncluirOperador', sql.Bit, incluirOperador)
            .input('IncluirAnulados', sql.Bit, incluirAnulados)
            .input('SoloAnulados', sql.Bit, soloAnulados)
            .input('IncluirCalle', sql.Bit, incluirCalle)
            .input('nro_movil', sql.Int, dynamicParam === 'nro_movil' ? valorInt : null)
            .input('nro_viaje', sql.Int, dynamicParam === 'nro_viaje' ? valorInt : null)
            .input('Direccion', sql.NVarChar(200), dynamicParam === 'Direccion' ? valor : null)
            .input('numero', sql.Int, dynamicParam === 'numero' ? valorInt : null)
            .input('telefono', sql.NVarChar(40), dynamicParam === 'telefono' ? valor : null)
            .input('nro_usuario_telefonista', sql.NVarChar(40), dynamicParam === 'nro_usuario_telefonista' ? valor : null)
            .input('Conductor', sql.NVarChar(200), dynamicParam === 'Conductor' ? valor : null)
            .input('FormaPago', sql.VarChar(3), formaPago || null);

        const result = await request.execute('VIAJA_ViajesFiltrados_Tildes3');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en historicos/lista:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
