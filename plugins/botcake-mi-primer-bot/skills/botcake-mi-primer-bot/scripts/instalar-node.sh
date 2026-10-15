#!/bin/sh
# Instala Node.js (la ultima version LTS) en Mac con el instalador oficial de nodejs.org.
# Antes de instalar comprueba que el archivo descargado coincide con la suma SHA-256 que publica
# nodejs.org. La instalacion la autoriza el usuario en la ventana de contrasena del Mac: Claude
# nunca ve la contrasena. Si ya hay Node 20 o superior (el minimo del navegador del plugin,
# Playwright), no hace nada.
#
#   sh instalar-node.sh             instala, solo si falta
#   sh instalar-node.sh --solo-ver  dice que version y que archivo bajaria, sin instalar
#
# La ultima linea es una de: YA_ESTABA <version> | INSTALADO <version> | SOLO_VER ... | ERROR: ...
set -u
SOLO_VER=0
[ "${1:-}" = "--solo-ver" ] && SOLO_VER=1

# El ensayo (--solo-ver) no mira lo instalado: siempre dice que bajaria.
[ "$SOLO_VER" = 1 ] || for n in "$(command -v node 2>/dev/null)" /usr/local/bin/node /opt/homebrew/bin/node; do
  if [ -n "$n" ] && [ -x "$n" ]; then
    v=$("$n" -v 2>/dev/null)
    case "$v" in v2[0-9].*|v[3-9][0-9].*) echo "YA_ESTABA $v ($n)"; exit 0 ;; esac
  fi
done

TMP=$(mktemp -d) || { echo "ERROR: no pude crear una carpeta temporal"; exit 1; }
trap 'rm -rf "${TMP:?}"' EXIT

curl -fsSL https://nodejs.org/dist/index.tab -o "$TMP/index.tab" ||
  { echo "ERROR: no pude leer la lista de versiones de nodejs.org. Revisa la conexion y repite."; exit 1; }
V=$(awk -F'\t' 'NR > 1 && $10 != "-" { print $1; exit }' "$TMP/index.tab")
[ -n "$V" ] || { echo "ERROR: no encontre una version LTS en la lista de nodejs.org"; exit 1; }

PKG="node-$V.pkg"
URL="https://nodejs.org/dist/$V/$PKG"
curl -fsSL "https://nodejs.org/dist/$V/SHASUMS256.txt" -o "$TMP/sumas.txt" ||
  { echo "ERROR: no pude bajar las sumas oficiales de nodejs.org"; exit 1; }
SUMA=$(awk -v f="$PKG" '$2 == f { print $1 }' "$TMP/sumas.txt")
[ -n "$SUMA" ] || { echo "ERROR: nodejs.org no publica la suma de $PKG"; exit 1; }

if [ "$SOLO_VER" = 1 ]; then
  echo "SOLO_VER $V $URL sha256=$SUMA"
  exit 0
fi

echo "Descargando Node.js $V desde nodejs.org..."
curl -fL --progress-bar "$URL" -o "$TMP/$PKG" || { echo "ERROR: la descarga fallo. Revisa la conexion y repite."; exit 1; }
REAL=$(shasum -a 256 "$TMP/$PKG" | awk '{ print $1 }')
[ "$REAL" = "$SUMA" ] ||
  { echo "ERROR: el archivo descargado no coincide con la suma oficial de nodejs.org. No se instalo nada."; exit 1; }

echo "Archivo comprobado. Se abre la ventana del Mac para autorizar la instalacion."
osascript -e "do shell script \"/usr/sbin/installer -pkg '$TMP/$PKG' -target /\" with prompt \"Claude va a instalar Node.js $V, que necesita el plugin Mi primer bot con Pancake.\" with administrator privileges" >/dev/null 2>&1 ||
  { echo "ERROR: la instalacion no se autorizo o fallo. Si cancelaste la ventana, no se instalo nada."; exit 1; }

v=$(/usr/local/bin/node -v 2>/dev/null)
[ -n "$v" ] || { echo "ERROR: el instalador termino, pero no encuentro /usr/local/bin/node"; exit 1; }
echo "INSTALADO $v (/usr/local/bin/node)"
