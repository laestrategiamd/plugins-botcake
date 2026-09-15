// Cliente de la API interna de Botcake. Node 18 o superior (usa fetch y FormData nativos).
// No editar sin probar contra una cuenta de prueba: la API dice "success" en varios
// sitios donde no guardo nada. Cada funcion de escritura relee y comprueba.
'use strict';
const fs = require('fs');
const path = require('path');

const BASE = 'https://botcake.io/api/v1/pages';
const SESION = '.botcake-sesion';

function key(n = 8) {
  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < n; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

function dormir(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Los caracteres se cuentan como los cuenta la pantalla de Botcake (unidades UTF-16):
// un emoji vale 2. En JavaScript, .length ya mide asi.
function medir(texto) {
  return texto.length;
}

function aSlate(texto) {
  return texto.split('\n').map((l) => ({ type: 'paragraph', children: [{ text: l }] }));
}

function deSlate(slate) {
  return (slate || [])
    .map((p) => (p.children || []).map((c) => c.text || '').join(''))
    .join('\n');
}

function cargarSesion() {
  if (!fs.existsSync(SESION)) {
    throw new Error(
      'No encuentro la sesion. Hay que repetir los pasos 2 y 3 de la Fase 6:\n' +
        '  el usuario inicia sesion en el navegador y se vuelve a guardar la llave.'
    );
  }
  const d = JSON.parse(fs.readFileSync(SESION, 'utf8'));
  if (!d.token || !d.page_id) {
    throw new Error('La sesion guardada esta incompleta. Repetir los pasos 2 y 3 de la Fase 6.');
  }
  return d;
}

function indexado(ficha) {
  // Los dos ids del indexado viven DENTRO de meta_data, no en el primer nivel.
  const m = (ficha && ficha.meta_data) || {};
  return Boolean(m.openai_file_id && m.cake_ai_file_id);
}

class Botcake {
  constructor(opts = {}) {
    const s = opts.pageId && opts.token ? null : cargarSesion();
    this.pageId = opts.pageId || s.page_id;
    this.token = opts.token || s.token;
  }

  _url(p) {
    const sep = p.includes('?') ? '&' : '?';
    return `${BASE}/${this.pageId}/${p}${sep}access_token=${this.token}`;
  }

  async _leer(promesa) {
    let res;
    try {
      res = await promesa;
    } catch (e) {
      return { success: false, error: `sin conexion: ${e.message}` };
    }
    const cuerpo = await res.text();
    try {
      return JSON.parse(cuerpo);
    } catch (e) {
      return { success: false, http: res.status, error: cuerpo.slice(0, 400) };
    }
  }

  get(p) {
    return this._leer(fetch(this._url(p), { method: 'GET' }));
  }

  delete(p) {
    return this._leer(fetch(this._url(p), { method: 'DELETE' }));
  }

  _form(campos, archivo) {
    const fd = new FormData();
    for (const [n, v] of campos) fd.append(n, v);
    if (archivo) {
      fd.append('file', new Blob([archivo.datos], { type: archivo.tipo }), archivo.nombre);
    }
    return fd;
  }

  post(p, campos) {
    return this._leer(fetch(this._url(p), { method: 'POST', body: this._form(campos) }));
  }

  put(p, campos) {
    return this._leer(fetch(this._url(p), { method: 'PUT', body: this._form(campos) }));
  }

  postArchivo(p, ruta, campos = []) {
    const archivo = {
      nombre: path.basename(ruta),
      datos: fs.readFileSync(ruta),
      tipo: 'text/plain',
    };
    return this._leer(fetch(this._url(p), { method: 'POST', body: this._form(campos, archivo) }));
  }

  // ---------- etiquetas ----------
  async etiquetas() {
    const r = await this.get('tags');
    return Array.isArray(r.tags) ? r.tags : [];
  }

  async crearEtiqueta(nombre, color = '#7B2D8E') {
    if (nombre.length > 15) {
      throw new Error(`La etiqueta '${nombre}' tiene ${nombre.length} caracteres. El maximo es 15.`);
    }
    const r = await this.post('tags', [
      ['selectedTag[name]', nombre],
      ['selectedTag[tag_type]', 'pancake'],
      ['selectedTag[color]', color],
    ]);
    // Botcake responde HTTP 200 con success:false cuando rechaza: hay que leer la lista.
    const t = (await this.etiquetas()).find((x) => x.name === nombre);
    if (!t) throw new Error(`No se pudo crear la etiqueta '${nombre}': ${JSON.stringify(r).slice(0, 200)}`);
    return t;
  }

  async asegurarEtiquetas(specs) {
    const hay = new Map((await this.etiquetas()).map((t) => [t.name, t]));
    const out = {};
    for (const [nombre, color] of specs) {
      const t = hay.get(nombre);
      out[nombre] = t ? t.id : (await this.crearEtiqueta(nombre, color)).id;
    }
    return out;
  }

  // ---------- campos personalizados ----------
  async campos() {
    const r = await this.get('custom_field');
    return r.custom_fields || r.data || [];
  }

  crearCampo(nombre) {
    return this.post('custom_field', [
      ['changes', JSON.stringify({
        name: nombre, type: 1, description: '', sync_crm: [],
        order_field: null, sync_crm_index: [], folder_id: null,
      })],
    ]);
  }

  async asegurarCampos(nombres) {
    const hay = new Map((await this.campos()).map((c) => [c.name, c.id]));
    const out = {};
    for (const n of nombres) {
      if (hay.has(n)) { out[n] = hay.get(n); continue; }
      await this.crearCampo(n);
      const c = (await this.campos()).find((x) => x.name === n);
      if (!c) throw new Error(`No se pudo crear el campo '${n}'.`);
      out[n] = c.id;
    }
    return out;
  }

  // ---------- agentes ----------
  async agentes() {
    const r = await this.get('ai/assistants');
    return r.assistants || r.data || [];
  }

  async agente(id) {
    return (await this.get(`ai/${id}`)).assistant || null;
  }

  guardarAgente(id, objeto) {
    return this.put(`ai/${id}`, [['changes', JSON.stringify(objeto)]]);
  }

  // Escribe el prompt en LOS DOS campos donde vive y comprueba releyendo.
  // Devuelve {plano, slate, iguales, vector_antes, vector_ahora}.
  async ponerPrompt(id, texto) {
    const a = await this.agente(id);
    if (!a) throw new Error(`No encontre el agente ${id}.`);
    const vectorAntes = (a.settings || {}).vector_store_id || null;
    a.instructions = a.instructions || {};
    a.instructions.general_prompt = texto;
    a.instructions.slate_general_prompt = aSlate(texto);
    await this.guardarAgente(id, a);

    let v = await this.agente(id);
    // El PUT puede tirar el vector_store_id (indice de la KB). Si lo tenia y ya no, se restaura.
    if (vectorAntes && !((v.settings || {}).vector_store_id)) {
      v.settings = v.settings || {};
      v.settings.vector_store_id = vectorAntes;
      await this.guardarAgente(id, v);
      v = await this.agente(id);
    }
    const ins = v.instructions || {};
    const plano = ins.general_prompt || '';
    const slate = deSlate(ins.slate_general_prompt);
    return {
      plano: medir(plano), slate: medir(slate), iguales: plano.trim() === slate.trim(),
      vector_antes: vectorAntes, vector_ahora: (v.settings || {}).vector_store_id || null,
      archivos: (v.files_library || []).length,
    };
  }

  // Sube un archivo y lo engancha al agente. Devuelve la ficha ya indexada.
  async adjuntarKb(id, ruta) {
    const r = await this.postArchivo('ai/file', ruta);
    if (r && r.message === 'File already exists') {
      throw new Error(
        'Botcake ya tiene un archivo con este mismo contenido y no lo vuelve a subir.\n' +
          '  Cambia algo del archivo (por ejemplo la linea "Actualizado:" de la cabecera) y repite.'
      );
    }
    // La ficha viene bajo page_content (no bajo file ni data).
    const nuevo = r.page_content || r.file || r.data || null;
    if (!nuevo || !nuevo.id) throw new Error(`No se pudo subir el archivo: ${JSON.stringify(r).slice(0, 300)}`);

    // La ficha se guarda en disco ANTES de nada: si algo falla despues, el archivo ya esta en
    // la biblioteca de la pagina y volver a subirlo daria "File already exists" sin ficha.
    fs.mkdirSync('respaldos', { recursive: true });
    const rutaFicha = path.join('respaldos', `ficha-kb-${nuevo.id}.json`);
    fs.writeFileSync(rutaFicha, JSON.stringify(nuevo, null, 1));

    // meta_data.bytes llega en 0 aunque el archivo este entero: se comprueba descargando.
    // Justo despues de subir, la descarga puede dar 502: se reintenta con espera.
    const local = fs.readFileSync(ruta);
    const norm = (b) => b.toString('utf8').replace(/\r\n/g, '\n');
    let comprobado = false;
    let motivo = '';
    for (let i = 0; i < 8 && !comprobado; i++) {
      if (i) await dormir(8000);
      try {
        const res = await fetch(nuevo.path);
        if (!res.ok) { motivo = `HTTP ${res.status}`; continue; }
        const guardado = Buffer.from(await res.arrayBuffer());
        if (norm(guardado) !== norm(local)) {
          throw new Error('Lo que quedo en Botcake no coincide con el archivo local. No se engancha.');
        }
        comprobado = true;
      } catch (e) {
        if (e.message.startsWith('Lo que quedo')) throw e;
        motivo = e.message;
      }
    }
    if (!comprobado) {
      throw new Error(
        `No pude comprobar el archivo subido (${motivo}). No se engancha al agente.\n` +
          `  La ficha quedo en ${rutaFicha}. Para reintentar, cambia la linea "Actualizado:" de la cabecera.`
      );
    }

    const a = await this.agente(id);
    if (!a) throw new Error(`No encontre el agente ${id}.`);
    a.files_library = (a.files_library || []).filter((x) => x.id !== nuevo.id).concat([nuevo]);
    await this.guardarAgente(id, a);

    for (let i = 0; i < 8; i++) {
      await dormir(6000);
      const b = await this.agente(id);
      const f = (b.files_library || []).find((x) => x.id === nuevo.id);
      if (f && indexado(f)) return f;
    }
    return null;
  }

  async quitarKb(id, dejarSoloId) {
    const a = await this.agente(id);
    a.files_library = (a.files_library || []).filter((x) => x.id === dejarSoloId);
    await this.guardarAgente(id, a);
    return ((await this.agente(id)).files_library || []).length;
  }

  // Extraccion automatica de datos a campos personalizados (settings.informations).
  async ponerExtraccion(id, items) {
    const a = await this.agente(id);
    if (!a) throw new Error(`No encontre el agente ${id}.`);
    a.settings = a.settings || {};
    a.settings.informations = items;
    await this.guardarAgente(id, a);
    const v = await this.agente(id);
    return ((v.settings || {}).informations || []).length;
  }

  // Prueba rapida del agente sin navegador. Cuesta centavos de la billetera.
  async preguntarAgente(id, mensaje) {
    const a = await this.agente(id);
    if (!a) throw new Error(`No encontre el agente ${id}.`);
    return this.post('ai/send_message', [
      ['message', JSON.stringify(mensaje)],
      ['assistant', JSON.stringify(a)],
      ['attachment_type', 'text'],
    ]);
  }

  // ---------- palabras clave ----------
  async palabras() {
    const r = await this.get('keywords');
    return r.keywords || r.data || [];
  }

  borrarPalabra(id) {
    return this.delete(`keywords/${id}`);
  }

  // ---------- flujos ----------
  async crearFlujo(nombre) {
    const r = await this.post('flow/create', [
      ['changes', JSON.stringify({ name: nombre, contents: [], path: [], blocks: [] })],
    ]);
    const f = r.flow || {};
    if (!f.id) throw new Error(`No se pudo crear el flujo: ${JSON.stringify(r).slice(0, 300)}`);
    return f.id;
  }

  guardarFlujo(id, nombre, bloques) {
    return this.post('flow/draft', [
      ['changes', JSON.stringify({ id, name: nombre, is_locked: null, config: {}, blocks: bloques })],
    ]);
  }

  async flujo(id) {
    return (await this.get(`flow/${id}`)).flow || {};
  }

  // ---------- clientes (para leer lo que respondio el bot) ----------
  async clientes(pagina = 1, tamano = 20) {
    const r = await this.get(`customers?page=${pagina}&page_size=${tamano}`);
    return r.customers || r.data || [];
  }

  async clienteInfo(id) {
    return (await this.get(`customers/${id}/info`)).customer_info || null;
  }

  // ---------- respaldo ----------
  // Baja a disco todos los agentes (completos) y la lista de flujos. Botcake no tiene
  // papelera: esto es lo unico que permite recuperar un prompt si algo se pisa.
  async respaldo(carpeta = 'respaldos') {
    fs.mkdirSync(carpeta, { recursive: true });
    const agentes = [];
    for (const a of await this.agentes()) {
      agentes.push((await this.agente(a.id)) || a);
    }
    const flujos = await this.post('flow', [['change', JSON.stringify({ path: [] })]]);
    const sello = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const ruta = path.join(carpeta, `respaldo-${this.pageId}-${sello}.json`);
    fs.writeFileSync(ruta, JSON.stringify({ agentes, flujos }, null, 1));
    return { ruta, agentes: agentes.length };
  }
}

module.exports = { Botcake, key, medir, aSlate, deSlate, indexado, dormir, SESION };
