#!/usr/bin/env node
// Gancho de inicio de sesion: compara la version instalada del plugin con la publicada en
// GitHub y, si hay una mas nueva, avisa al usuario y le pide a Claude que ofrezca actualizar.
// Nunca estorba: sin internet, sin respuesta en 3 segundos o ante cualquier error, no dice nada.
'use strict';
const fs = require('fs');
const path = require('path');

function comparar(a, b) {
  const x = String(a).split('.').map(Number);
  const y = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] || 0) - (y[i] || 0);
    if (d) return d;
  }
  return 0;
}

async function main() {
  const raiz = process.env.CLAUDE_PLUGIN_ROOT || path.join(__dirname, '..');
  const local = JSON.parse(fs.readFileSync(path.join(raiz, '.claude-plugin', 'plugin.json'), 'utf8'));
  const repo = String(local.repository || '').match(/github\.com\/([^/]+\/[^/.]+)/);
  if (!repo || !local.version) return;

  const url = `https://raw.githubusercontent.com/${repo[1]}/HEAD/.claude-plugin/marketplace.json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) return;
  const mk = await res.json();
  const remoto = (mk.plugins || []).find((p) => p.name === local.name);
  if (!remoto || !remoto.version || comparar(remoto.version, local.version) <= 0) return;

  const nombre = local.displayName || local.name;
  const instalar = `claude plugin marketplace update ${mk.name} y claude plugin update ${local.name}@${mk.name}`;
  console.log(JSON.stringify({
    systemMessage: `Hay una versión nueva del plugin «${nombre}»: la ${remoto.version} (tienes la ${local.version}). Pídele a Claude que lo actualice.`,
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext:
        `El plugin «${nombre}» (${local.name}) tiene publicada la versión ${remoto.version} y el usuario tiene instalada la ${local.version}. ` +
        'Antes de seguir con cualquier recorrido del plugin, díselo en español con palabras sencillas y ofrécele actualizarlo: ' +
        `con su permiso ejecuta ${instalar}. Después tiene que abrir una sesión nueva para que cargue la versión nueva. ` +
        'Si no quiere actualizar ahora, sigue con la versión que tiene. No lo actualices sin su permiso.',
    },
  }));
}

main().catch(() => {}).finally(() => process.exit(0));
