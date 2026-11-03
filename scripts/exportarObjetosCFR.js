// Genera un script .sql para llevar los objetos de la migración (tablas y SPs con prefijo CFR_) a
// otra base SQL Server. Sólo LEE la base de origen (la del .env del API); no modifica nada.
//
// Uso (desde control-flota-api):
//   node scripts/exportarObjetosCFR.js <archivo-salida.sql> [prefijo]
//   node scripts/exportarObjetosCFR.js C:\temp\cfr.sql
//
// Después, abrir el .sql en SSMS conectado a la base DESTINO y ejecutarlo (o con sqlcmd -i).
// No guardar el .sql generado dentro del repo: contiene datos (por ejemplo, el log de logins).
//
// Qué hace el script generado, en este orden:
//   1. Tablas: las crea SÓLO si no existen (nunca borra ni modifica una tabla del destino),
//      con columnas, IDENTITY, defaults, clave primaria e índices.
//   2. Datos: inserta las filas SÓLO si la tabla destino está vacía (si ya tiene datos, la saltea
//      para no duplicar). Conserva los valores de IDENTITY.
//   3. SPs: los reemplaza (DROP + CREATE) con la versión de origen.
// Lo que no sabe copiar (FKs, CHECKs, triggers, vistas, funciones) lo informa como advertencia.
const fs = require('fs');
const path = require('path');
const { poolPromise, sql } = require('../db');

const salida = process.argv[2];
const prefijo = process.argv[3] || 'CFR_';
if (!salida) {
    console.error('Uso: node scripts/exportarObjetosCFR.js <archivo-salida.sql> [prefijo]');
    process.exit(1);
}

const FILAS_POR_INSERT = 500;   // SQL Server admite hasta 1000 filas por INSERT ... VALUES
const nombre = n => `[${n.replace(/]/g, ']]')}]`;          // cita nombres (hay uno con espacio al final)
const completo = n => `[dbo].${nombre(n)}`;
const texto = s => `N'${String(s).replace(/'/g, "''")}'`;   // literal T-SQL

// LIKE con el prefijo tomado literal: el "_" de CFR_ es comodín en LIKE.
const likePrefijo = prefijo.replace(/[[\]_%]/g, c => `[${c}]`) + '%';

async function main() {
    const pool = await poolPromise;
    const q = async (consulta, params = {}) => {
        const r = pool.request();
        for (const [k, v] of Object.entries(params)) r.input(k, v);
        return (await r.query(consulta)).recordset;
    };

    const [{ base, servidor }] = await q('SELECT DB_NAME() AS base, @@SERVERNAME AS servidor');
    const advertencias = [];
    const out = [];
    const linea = (s = '') => out.push(s);

    linea(`-- =============================================================================`);
    linea(`-- Objetos ${prefijo}* exportados de ${servidor} / ${base} el ${new Date().toLocaleString('es-AR')}`);
    linea(`-- Generado por control-flota-api/scripts/exportarObjetosCFR.js`);
    linea(`-- Ejecutar conectado a la base DESTINO. No borra tablas ni datos existentes:`);
    linea(`--   tablas -> se crean si no existen | datos -> sólo en tablas vacías | SPs -> se reemplazan`);
    linea(`-- =============================================================================`);
    linea(`SET NOCOUNT ON;`);
    linea(`GO`);
    linea();

    // ---------------------------------------------------------------- TABLAS
    const tablas = await q(`SELECT object_id, name FROM sys.tables WHERE name LIKE @p AND is_ms_shipped = 0 ORDER BY name`, { p: likePrefijo });

    for (const t of tablas) {
        const cols = await q(`
            SELECT c.column_id, c.name, TYPE_NAME(c.user_type_id) AS tipo, c.max_length, c.precision, c.scale,
                   c.is_nullable, c.is_identity, c.is_computed,
                   ic.seed_value, ic.increment_value, cc.definition AS calculo,
                   dc.name AS df_nombre, dc.definition AS df_valor
            FROM sys.columns c
            LEFT JOIN sys.identity_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id
            LEFT JOIN sys.computed_columns cc ON cc.object_id = c.object_id AND cc.column_id = c.column_id
            LEFT JOIN sys.default_constraints dc ON dc.object_id = c.default_object_id
            WHERE c.object_id = @id ORDER BY c.column_id`, { id: t.object_id });

        const indices = await q(`
            SELECT i.index_id, i.name, i.type_desc, i.is_primary_key, i.is_unique, i.is_unique_constraint
            FROM sys.indexes i WHERE i.object_id = @id AND i.index_id > 0 AND i.is_hypothetical = 0
            ORDER BY i.is_primary_key DESC, i.index_id`, { id: t.object_id });
        const colsIndice = await q(`
            SELECT ic.index_id, c.name, ic.is_descending_key, ic.is_included_column, ic.key_ordinal
            FROM sys.index_columns ic JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
            WHERE ic.object_id = @id ORDER BY ic.index_id, ic.key_ordinal, ic.index_column_id`, { id: t.object_id });

        const [extras] = await q(`
            SELECT (SELECT COUNT(*) FROM sys.foreign_keys WHERE parent_object_id = @id) AS fks,
                   (SELECT COUNT(*) FROM sys.check_constraints WHERE parent_object_id = @id) AS checks,
                   (SELECT COUNT(*) FROM sys.triggers WHERE parent_id = @id) AS triggers`, { id: t.object_id });
        if (extras.fks || extras.checks || extras.triggers) {
            advertencias.push(`Tabla ${nombre(t.name)}: tiene ${extras.fks} FK, ${extras.checks} CHECK y ${extras.triggers} triggers que NO se exportan; crearlos a mano.`);
        }

        const tipoSql = c => {
            const t2 = c.tipo.toLowerCase();
            if (['varchar', 'char', 'varbinary', 'binary'].includes(t2)) return `${t2}(${c.max_length === -1 ? 'max' : c.max_length})`;
            if (['nvarchar', 'nchar'].includes(t2)) return `${t2}(${c.max_length === -1 ? 'max' : c.max_length / 2})`;
            if (['decimal', 'numeric'].includes(t2)) return `${t2}(${c.precision}, ${c.scale})`;
            if (['datetime2', 'time', 'datetimeoffset'].includes(t2)) return `${t2}(${c.scale})`;
            return t2;
        };

        const defs = cols.map(c => {
            if (c.is_computed) return `    ${nombre(c.name)} AS ${c.calculo}`;
            let d = `    ${nombre(c.name)} ${tipoSql(c)}`;
            if (c.is_identity) d += ` IDENTITY(${c.seed_value}, ${c.increment_value})`;
            d += c.is_nullable ? ' NULL' : ' NOT NULL';
            if (c.df_nombre) d += ` CONSTRAINT ${nombre(c.df_nombre)} DEFAULT ${c.df_valor}`;
            return d;
        });

        const columnasDe = (indexId, incluidas) => colsIndice
            .filter(x => x.index_id === indexId && !!x.is_included_column === incluidas)
            .map(x => incluidas ? nombre(x.name) : `${nombre(x.name)} ${x.is_descending_key ? 'DESC' : 'ASC'}`)
            .join(', ');

        const pk = indices.find(i => i.is_primary_key);
        if (pk) defs.push(`    CONSTRAINT ${nombre(pk.name)} PRIMARY KEY ${pk.type_desc} (${columnasDe(pk.index_id, false)})`);

        linea(`-- ---------------------------------------------------------------- Tabla ${t.name}`);
        linea(`IF OBJECT_ID(N'${completo(t.name).replace(/'/g, "''")}', N'U') IS NULL`);
        linea(`BEGIN`);
        linea(`    CREATE TABLE ${completo(t.name)} (`);
        linea(defs.map(d => '    ' + d).join(',\n'));
        linea(`    );`);
        linea(`    PRINT 'Tabla creada: ${t.name.replace(/'/g, "''")}';`);
        linea(`END`);
        linea(`ELSE PRINT 'Tabla existente, se deja como está: ${t.name.replace(/'/g, "''")}';`);
        linea(`GO`);

        for (const i of indices.filter(x => !x.is_primary_key)) {
            const claves = columnasDe(i.index_id, false);
            const incl = columnasDe(i.index_id, true);
            const sentencia = i.is_unique_constraint
                ? `ALTER TABLE ${completo(t.name)} ADD CONSTRAINT ${nombre(i.name)} UNIQUE ${i.type_desc} (${claves});`
                : `CREATE ${i.is_unique ? 'UNIQUE ' : ''}${i.type_desc} INDEX ${nombre(i.name)} ON ${completo(t.name)} (${claves})${incl ? ` INCLUDE (${incl})` : ''};`;
            linea(`IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'${completo(t.name).replace(/'/g, "''")}') AND name = ${texto(i.name)})`);
            linea(`    ${sentencia}`);
            linea(`GO`);
        }

        // -------------------------------------------- DATOS de la tabla
        // Cada valor se convierte a literal T-SQL DENTRO de SQL Server (no en Node): así las
        // fechas no pasan por la zona horaria de JavaScript ni por db.js (useUTC: false).
        const copiables = cols.filter(c => !c.is_computed && !['timestamp', 'rowversion'].includes(c.tipo.toLowerCase()));
        const literal = c => {
            const n = nombre(c.name), t2 = c.tipo.toLowerCase();
            let v;
            if (['char', 'varchar', 'nchar', 'nvarchar', 'text', 'ntext', 'sysname', 'xml'].includes(t2))
                v = `'N''' + REPLACE(CAST(${n} AS nvarchar(max)), '''', '''''') + ''''`;
            else if (['datetime', 'smalldatetime', 'date', 'datetime2', 'datetimeoffset', 'time'].includes(t2))
                v = `'''' + CONVERT(varchar(40), ${n}, 126) + ''''`;
            else if (['float', 'real'].includes(t2))
                v = `CONVERT(varchar(40), ${n}, 2)`;
            else if (['binary', 'varbinary', 'image'].includes(t2))
                v = `CONVERT(varchar(max), CAST(${n} AS varbinary(max)), 1)`;
            else if (t2 === 'uniqueidentifier')
                v = `'''' + CONVERT(varchar(36), ${n}) + ''''`;
            else
                v = `CONVERT(varchar(60), ${n})`;   // enteros, bit, decimal, money
            return `CASE WHEN ${n} IS NULL THEN 'NULL' ELSE ${v} END`;
        };
        const orden = pk ? columnasDe(pk.index_id, false) : nombre(copiables[0].name);
        const filas = await q(`SELECT '(' + ${copiables.map(literal).join(" + ', ' + ")} + ')' AS fila FROM ${completo(t.name)} ORDER BY ${orden}`);

        if (filas.length > 0) {
            const tieneIdentity = copiables.some(c => c.is_identity);
            const listaCols = copiables.map(c => nombre(c.name)).join(', ');
            linea(`-- Datos de ${t.name}: ${filas.length} filas (sólo si la tabla destino está vacía)`);
            linea(`IF NOT EXISTS (SELECT 1 FROM ${completo(t.name)})`);
            linea(`BEGIN`);
            linea(`    SET XACT_ABORT ON;`);
            linea(`    BEGIN TRANSACTION;`);
            if (tieneIdentity) linea(`    SET IDENTITY_INSERT ${completo(t.name)} ON;`);
            for (let i = 0; i < filas.length; i += FILAS_POR_INSERT) {
                linea(`    INSERT INTO ${completo(t.name)} (${listaCols}) VALUES`);
                linea(filas.slice(i, i + FILAS_POR_INSERT).map(f => `        ${f.fila}`).join(',\n') + ';');
            }
            if (tieneIdentity) linea(`    SET IDENTITY_INSERT ${completo(t.name)} OFF;`);
            linea(`    COMMIT TRANSACTION;`);
            linea(`    PRINT 'Datos copiados: ${t.name.replace(/'/g, "''")} (${filas.length} filas)';`);
            linea(`END`);
            linea(`ELSE PRINT 'Datos NO copiados (la tabla destino ya tiene filas): ${t.name.replace(/'/g, "''")}';`);
            linea(`GO`);
        }
        linea();
    }

    // ---------------------------------------------------------------- SPs
    const sps = await q(`
        SELECT o.name, m.definition, m.uses_ansi_nulls, m.uses_quoted_identifier
        FROM sys.procedures o JOIN sys.sql_modules m ON m.object_id = o.object_id
        WHERE o.name LIKE @p AND o.is_ms_shipped = 0 ORDER BY o.name`, { p: likePrefijo });

    // Encabezado "CREATE PROC[EDURE] [esquema].nombre": se reemplaza por el nombre ACTUAL del SP.
    // Hace falta porque sp_rename cambia el nombre del objeto pero no el texto guardado: copiado
    // tal cual, el SP se crearía en el destino con el nombre viejo.
    const CREATE_RE = /CREATE\s+PROC(?:EDURE)?\s+(?:(?:\[[^\]]+\]|\w+)\s*\.\s*)?(?:\[[^\]]+\]|[\w#]+)/i;
    let renombrados = 0;

    linea(`-- =============================================================================`);
    linea(`-- STORED PROCEDURES (${sps.length}) — se reemplazan si ya existen`);
    linea(`-- =============================================================================`);
    for (const sp of sps) {
        const m = sp.definition.match(CREATE_RE);
        if (!m) { advertencias.push(`SP ${sp.name}: no se encontró el CREATE PROCEDURE en su texto; se omitió.`); continue; }
        const nuevoEncabezado = `CREATE PROCEDURE ${completo(sp.name)}`;
        if (!m[0].replace(/[\s[\]]/g, '').toLowerCase().endsWith(sp.name.toLowerCase())) renombrados++;
        const definicion = sp.definition.replace(CREATE_RE, nuevoEncabezado).trim();

        linea(`IF OBJECT_ID(N'${completo(sp.name).replace(/'/g, "''")}', N'P') IS NOT NULL DROP PROCEDURE ${completo(sp.name)};`);
        linea(`GO`);
        linea(`SET ANSI_NULLS ${sp.uses_ansi_nulls ? 'ON' : 'OFF'};`);
        linea(`SET QUOTED_IDENTIFIER ${sp.uses_quoted_identifier ? 'ON' : 'OFF'};`);
        linea(`GO`);
        linea(definicion);
        linea(`GO`);
        linea();
    }

    // Otros objetos con el prefijo que el script no copia.
    const otros = await q(`SELECT name, type_desc FROM sys.objects WHERE name LIKE @p AND is_ms_shipped = 0
                           AND type NOT IN ('U', 'P', 'PK', 'D', 'UQ', 'F', 'C', 'TR', 'IT', 'S')`, { p: likePrefijo });
    for (const o of otros) advertencias.push(`${o.type_desc} ${o.name}: no se exporta; copiarlo a mano.`);

    if (advertencias.length) {
        linea(`-- ADVERTENCIAS`);
        advertencias.forEach(a => linea(`--   ${a}`));
    }
    linea(`PRINT 'Fin de la importación de objetos ${prefijo}*.';`);
    linea(`GO`);

    // UTF-8 con BOM: SSMS y sqlcmd lo detectan y respetan las tildes y la ñ.
    fs.writeFileSync(salida, '\ufeff' + out.join('\r\n') + '\r\n', 'utf8');

    console.log(`Script generado: ${path.resolve(salida)}`);
    console.log(`  Tablas: ${tablas.length} | SPs: ${sps.length} (${renombrados} con el nombre corregido por sp_rename)`);
    if (advertencias.length) { console.log('  Advertencias:'); advertencias.forEach(a => console.log('   - ' + a)); }
    process.exit(0);
}

main().catch(err => { console.error('Error al generar el script:', err.message); process.exit(1); });
