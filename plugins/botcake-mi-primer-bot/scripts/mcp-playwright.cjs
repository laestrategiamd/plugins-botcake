// Arranca el navegador automatizado (Playwright MCP) igual en Mac, Windows y Linux.
// Existe porque en Windows "npx" es un archivo .cmd y hay que lanzarlo por el shell;
// con este lanzador el .mcp.json solo necesita "node", que se llama igual en todos.
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');

const win = process.platform === 'win32';

// Si el usuario ya tiene Google Chrome, se usa ese: evita descargar un navegador aparte.
function hayChrome() {
  const rutas = win
    ? [
        `${process.env['ProgramFiles'] || 'C:\\Program Files'}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env.LOCALAPPDATA || ''}\\Google\\Chrome\\Application\\chrome.exe`,
      ]
    : process.platform === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
      : ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/opt/google/chrome/chrome'];
  return rutas.some((r) => r && fs.existsSync(r));
}

const args = ['-y', '@playwright/mcp@latest'];
if (hayChrome()) args.push('--browser', 'chrome');
args.push(...process.argv.slice(2));

const hijo = spawn(win ? 'npx.cmd' : 'npx', args, { stdio: 'inherit', shell: win });
hijo.on('error', (e) => {
  process.stderr.write(`No pude arrancar el navegador automatizado: ${e.message}\n`);
  process.exit(1);
});
hijo.on('exit', (codigo) => process.exit(codigo == null ? 0 : codigo));
