# Instala Node.js (la ultima version LTS) en Windows con el instalador oficial (.msi) de
# nodejs.org. Antes de instalar comprueba que el archivo descargado coincide con la suma SHA-256
# que publica nodejs.org. La instalacion la autoriza el usuario en la ventana de Windows que pide
# permiso para hacer cambios: Claude no la puede aceptar por el. Si ya hay Node 18 o superior,
# no hace nada. Guardado en UTF-8 con BOM y solo con ASCII: PowerShell 5.1 rompe sin avisar los
# .ps1 con acentos que no lo llevan.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File instalar-node.ps1            instala, solo si falta
#   powershell -NoProfile -ExecutionPolicy Bypass -File instalar-node.ps1 -SoloVer   dice que bajaria, sin instalar
#
# La ultima linea es una de: YA_ESTABA <version> | INSTALADO <version> | SOLO_VER ... | ERROR: ...
param([switch]$SoloVer)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'   # con la barra de progreso, PowerShell 5.1 descarga muy lento
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Version-Node([string]$exe) {
  try {
    $v = (& $exe -v 2>$null | Out-String).Trim()
    if ($v -match '^v(\d+)\.' -and [int]$Matches[1] -ge 18) { return $v }
  } catch {}
  return $null
}

$enProgramas = Join-Path $env:ProgramFiles 'nodejs\node.exe'

# El ensayo (-SoloVer) no mira lo instalado: siempre dice que bajaria.
if (-not $SoloVer) {
  $candidatos = @()
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd) { $candidatos += $cmd.Source }
  $candidatos += $enProgramas
  foreach ($c in $candidatos) {
    if ($c -and (Test-Path $c)) {
      $v = Version-Node $c
      if ($v) { Write-Output "YA_ESTABA $v ($c)"; exit 0 }
    }
  }
}

try {
  $tab = (Invoke-WebRequest -UseBasicParsing 'https://nodejs.org/dist/index.tab').Content
} catch {
  Write-Output 'ERROR: no pude leer la lista de versiones de nodejs.org. Revisa la conexion y repite.'; exit 1
}
$V = $null
foreach ($linea in ($tab -split "`n" | Select-Object -Skip 1)) {
  $col = $linea.Trim() -split "`t"
  if ($col.Count -gt 9 -and $col[9] -ne '-') { $V = $col[0]; break }
}
if (-not $V) { Write-Output 'ERROR: no encontre una version LTS en la lista de nodejs.org'; exit 1 }

$arq = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'x64' }
$msi = "node-$V-$arq.msi"
$url = "https://nodejs.org/dist/$V/$msi"
try {
  $sumas = (Invoke-WebRequest -UseBasicParsing "https://nodejs.org/dist/$V/SHASUMS256.txt").Content
} catch {
  Write-Output 'ERROR: no pude bajar las sumas oficiales de nodejs.org'; exit 1
}
$suma = $null
foreach ($l in ($sumas -split "`n")) {
  $p = $l.Trim() -split '\s+'
  if ($p.Count -eq 2 -and $p[1] -eq $msi) { $suma = $p[0].ToLower(); break }
}
if (-not $suma) { Write-Output "ERROR: nodejs.org no publica la suma de $msi"; exit 1 }

if ($SoloVer) { Write-Output "SOLO_VER $V $url sha256=$suma"; exit 0 }

$destino = Join-Path $env:TEMP $msi
Write-Output "Descargando Node.js $V desde nodejs.org..."
try {
  Invoke-WebRequest -UseBasicParsing $url -OutFile $destino
} catch {
  Write-Output 'ERROR: la descarga fallo. Revisa la conexion y repite.'; exit 1
}
$real = (Get-FileHash -Algorithm SHA256 $destino).Hash.ToLower()
if ($real -ne $suma) {
  Remove-Item $destino -ErrorAction SilentlyContinue
  Write-Output 'ERROR: el archivo descargado no coincide con la suma oficial de nodejs.org. No se instalo nada.'; exit 1
}

Write-Output 'Archivo comprobado. Windows va a pedir permiso para instalar: hay que pulsar Si.'
try {
  $proc = Start-Process msiexec.exe -ArgumentList "/i `"$destino`" /passive /norestart" -Verb RunAs -Wait -PassThru
} catch {
  Write-Output 'ERROR: la instalacion no se autorizo. Si pulsaste No, no se instalo nada.'; exit 1
}
Remove-Item $destino -ErrorAction SilentlyContinue
# 0 = instalado; 3010 = instalado, Windows pide reiniciar en algun momento
if ($proc.ExitCode -ne 0 -and $proc.ExitCode -ne 3010) {
  Write-Output "ERROR: el instalador de Node termino con el codigo $($proc.ExitCode)"; exit 1
}
$v = Version-Node $enProgramas
if (-not $v) { Write-Output "ERROR: el instalador termino, pero no encuentro $enProgramas"; exit 1 }
Write-Output "INSTALADO $v ($enProgramas)"
