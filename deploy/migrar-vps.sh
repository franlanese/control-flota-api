#!/usr/bin/env bash
# Migración ÚNICA del VPS al esquema releases + symlink, con todo a nombre del usuario deploy.
#
#   sudo bash /home/deploy/migrar-vps.sh
#
# Qué hace (en orden, frena en el primer error):
#   0. Muestra qué procesos de pm2 (root) va a reemplazar y pide confirmación.
#   1. Crea /srv/control-flota/{api,front}/{staging,prod}/{releases,shared} y el script bin/flota.sh.
#   2. Copia los fronts actuales como primer release ("inicial-...").
#   3. Copia las APIs actuales como primer release; .env y public/fotos van a shared/.
#   4. Prueba las APIs nuevas en puertos temporales (7410/7411) SIN tocar el tráfico real.
#   5. nginx: apunta 8010 y 1000 a los symlinks nuevos (backup + nginx -t antes de recargar).
#   6. APIs: para el proceso viejo (root) y levanta el nuevo (deploy). CORTE de unos segundos por API.
#   7. pm2 de deploy arranca solo al reiniciar el servidor; el de root deja de tener estas APIs.
#
# NO borra nada: /home/React/control-flota-react*, /home/Node/control-flota-api* quedan intactas
# como respaldo. Para volver atrás: restaurar el backup de nginx y `pm2 start 0 1` (root).
set -euo pipefail

# Los comandos "como deploy" heredan la carpeta actual. Si es /root (o cualquiera donde deploy no
# puede entrar), pm2 no logra levantar su daemon: "spawn /usr/bin/node EACCES".
cd /

BASE=/srv/control-flota
FRONT_STG_OLD=/home/React/control-flota-react
FRONT_PRD_OLD=/home/React/control-flota-react-v1
API_STG_OLD=/home/Node/control-flota-api
API_PRD_OLD=/home/Node/control-flota-api-v1
PM2_ROOT_STG=0          # ids del pm2 de root (sudo pm2 ls)
PM2_ROOT_PRD=1
NGINX_SITE=/etc/nginx/sites-available/edt.ar
FLOTA_SH_SRC=/home/deploy/flota.sh
RID="inicial-$(date +%Y%m%d%H%M%S)"

paso() { echo; echo "=== $* ==="; }
como_deploy() { sudo -u deploy -H "$@"; }

[[ $EUID -eq 0 ]] || { echo "Correlo con sudo"; exit 1; }

# --continuar: retoma desde el paso 6 cuando 1-5 ya se hicieron (usa el release inicial existente).
MODO=completa
if [[ ${1:-} == --continuar ]]; then
    MODO=continuar
    [[ -L $BASE/api/staging/current && -L $BASE/api/prod/current ]] || { echo "No hay releases en $BASE: corré la migración sin --continuar"; exit 1; }
    RID=$(basename "$(readlink "$BASE/api/staging/current")")
    [[ $RID == "$(basename "$(readlink "$BASE/api/prod/current")")" ]] || { echo "staging y prod apuntan a releases distintos; revisar a mano"; exit 1; }
    echo "Modo --continuar: retomo desde el paso 6 con el release $RID"
else
    [[ ! -e $BASE ]] || { echo "$BASE ya existe: la migración ya se corrió o quedó a medias. Para retomar desde el paso 6: sudo bash $0 --continuar"; exit 1; }
fi
[[ -f $FLOTA_SH_SRC ]] || { echo "Falta $FLOTA_SH_SRC (subilo junto con este script)"; exit 1; }
for d in $FRONT_STG_OLD $FRONT_PRD_OLD $API_STG_OLD $API_PRD_OLD; do [[ -d $d ]] || { echo "No existe $d"; exit 1; }; done

paso "0. Procesos de pm2 (root) que se van a reemplazar"
for id in $PM2_ROOT_STG $PM2_ROOT_PRD; do
    pm2 describe "$id" | grep -E "│ (name|exec cwd|status) " || { echo "No existe el id $id en el pm2 de root"; exit 1; }
    echo
done
echo "Esperado: id $PM2_ROOT_STG = staging ($API_STG_OLD), id $PM2_ROOT_PRD = prod ($API_PRD_OLD)."
read -rp "¿Coincide? Escribí 'si' para seguir: " r
[[ $r == si ]] || { echo "Cancelado, no se tocó nada."; exit 1; }

if [[ $MODO == completa ]]; then

paso "1. Estructura en $BASE"
for app in api front; do
    for entorno in staging prod; do
        mkdir -p "$BASE/$app/$entorno/releases" "$BASE/$app/$entorno/shared"
    done
done
mkdir -p "$BASE/bin"
cp "$FLOTA_SH_SRC" "$BASE/bin/flota.sh"
sed -i 's/\r$//' "$BASE/bin/flota.sh"
chmod 755 "$BASE/bin/flota.sh"

paso "2. Fronts actuales -> primer release ($RID)"
copiar_front() { # $1=carpeta vieja $2=entorno
    local dir=$BASE/front/$2 rel=$BASE/front/$2/releases/$RID
    mkdir -p "$rel"
    cp -a "$1/." "$rel/"
    echo "$RID" > "$rel/version.txt"
    ln -sfn "releases/$RID" "$dir/current"
    echo "$RID" > "$dir/shared/historial"
    echo "  $1 -> $rel"
}
copiar_front "$FRONT_STG_OLD" staging
copiar_front "$FRONT_PRD_OLD" prod

paso "3. APIs actuales -> primer release ($RID); .env y fotos a shared/"
copiar_api() { # $1=carpeta vieja $2=entorno
    local dir=$BASE/api/$2 rel=$BASE/api/$2/releases/$RID
    mkdir -p "$rel" "$dir/shared/fotos"
    tar -C "$1" --exclude=./.env --exclude=./.git --exclude=./public/fotos -cf - . | tar -C "$rel" -xf -
    echo "$RID" > "$rel/REVISION"
    cp -a "$1/.env" "$dir/shared/.env"
    [[ -d "$1/public/fotos" ]] && cp -a "$1/public/fotos/." "$dir/shared/fotos/"
    ln -sfn "releases/$RID" "$dir/current"
    echo "$RID" > "$dir/shared/historial"
    echo "  $1 -> $rel (fotos: $(find "$dir/shared/fotos" -type f | wc -l) archivos)"
}
copiar_api "$API_STG_OLD" staging
copiar_api "$API_PRD_OLD" prod

chown -R deploy:deploy "$BASE"
chmod 600 "$BASE"/api/*/shared/.env

paso "4. Prueba de las APIs nuevas en puertos temporales (el tráfico real no se toca)"
como_deploy "$BASE/bin/flota.sh" probar api staging "$RID"
como_deploy "$BASE/bin/flota.sh" probar api prod "$RID"

paso "5. nginx: 8010 y 1000 pasan a servir los symlinks nuevos"
BACKUP="$NGINX_SITE.bak-$(date +%s)"
cp -a "$NGINX_SITE" "$BACKUP"
echo "  backup: $BACKUP"
sed -i \
    -e "s#root /home/React/control-flota-react;#root $BASE/front/staging/current;#" \
    -e "s#root /home/React/control-flota-react-v1;#root $BASE/front/prod/current;#" \
    "$NGINX_SITE"
if ! grep -q "root $BASE/front/staging/current;" "$NGINX_SITE" || ! grep -q "root $BASE/front/prod/current;" "$NGINX_SITE"; then
    cp -a "$BACKUP" "$NGINX_SITE"; echo "No se encontraron las líneas root esperadas; nginx restaurado."; exit 1
fi
if ! nginx -t; then
    cp -a "$BACKUP" "$NGINX_SITE"; echo "nginx -t falló; nginx restaurado sin recargar."; exit 1
fi
systemctl reload nginx
sleep 1
for p in 8010 1000; do
    v=$(curl -fsS --max-time 5 "http://127.0.0.1:$p/version.txt" || true)
    [[ $v == "$RID" ]] || { echo "Puerto $p no sirve el release nuevo (recibí '$v'). Restaurá: cp $BACKUP $NGINX_SITE && nginx -t && systemctl reload nginx"; exit 1; }
    echo "  :$p OK ($v)"
done

fi # fin de los pasos 1-5 (se saltean con --continuar)

paso "6. APIs: proceso viejo (root) -> proceso nuevo (deploy). CORTE de unos segundos."
esperar_health() { # $1=puerto. El código actual todavía no tiene /health: basta con que conteste HTTP.
    local i r
    for i in $(seq 1 40); do
        r=$(curl -s -o /dev/null -w '%{http_code}' --max-time 4 "http://127.0.0.1:$1/health" 2>/dev/null || true)
        [[ -n $r && $r != 000 ]] && return 0
        sleep 1
    done
    return 1
}
cambiar_api() { # $1=id root $2=entorno $3=nombre nuevo $4=puerto
    local dir=$BASE/api/$2
    echo "  Parando pm2 root id $1 ($2)..."
    pm2 stop "$1" >/dev/null
    if como_deploy pm2 start "$dir/current/index.js" --name "$3" --cwd "$dir/current" && esperar_health "$4"; then
        echo "  $2 OK: $3 en :$4"
    else
        echo "  $2 FALLÓ: vuelvo al proceso viejo"
        como_deploy pm2 delete "$3" >/dev/null 2>&1 || true
        pm2 start "$1" >/dev/null
        exit 1
    fi
}
cambiar_api "$PM2_ROOT_STG" staging flota-api-staging 7400
cambiar_api "$PM2_ROOT_PRD" prod    flota-api-prod    7401

paso "7. Arranque automático al reiniciar el servidor"
como_deploy pm2 save
env PATH="$PATH:/usr/bin" pm2 startup systemd -u deploy --hp /home/deploy
pm2 delete "$PM2_ROOT_STG" "$PM2_ROOT_PRD" >/dev/null
pm2 save   # el pm2 de root ya no resucita estas APIs al reiniciar (chocarían en el puerto)

paso "Listo"
como_deploy "$BASE/bin/flota.sh" estado
echo
echo "Carpetas viejas intactas como respaldo: $FRONT_STG_OLD $FRONT_PRD_OLD $API_STG_OLD $API_PRD_OLD"
