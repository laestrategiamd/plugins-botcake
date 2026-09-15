#!/usr/bin/env node
// El unico comando del plugin. Se corre desde la carpeta del proyecto del usuario
// (donde viven mi-bot.json y .botcake-sesion).
//
//   mibot sesion <llave> <page_id>                guarda la llave de sesion (Fase 6)
//   mibot probar                                  comprueba la conexion
//   mibot estado                                  lista etiquetas, campos y agentes
//   mibot respaldo                                baja los agentes a disco (antes de escribir)
//   mibot crear-etiqueta "Asesor" "#e74c3c"
//   mibot crear-campo "Nombre"
//   mibot medir <archivo.txt>                     cuenta los caracteres de un prompt
//   mibot poner-prompt <agente_id> <archivo.txt> [--tope 15000]
//   mibot subir-kb <agente_id> <archivo.txt> ["frase que tiene que estar"]
//   mibot extraer-datos <agente_id>               configura la extraccion (de mi-bot.json)
//   mibot ver-agente <agente_id>
//   mibot ver-conocimiento <agente_id> "frase que tiene que estar"
//   mibot preguntar <agente_id> "mensaje"         prueba rapida sin navegador (cuesta centavos)
//   mibot montar [--solo-ver]                     construye el flujo desde mi-bot.json
//   mibot palabras
//   mibot borrar-palabra <id>
//   mibot respuestas ["nombre o telefono"]        que respondio el bot y que etiquetas puso
'use strict';
const fs = require('fs');
const path = require('path');
const { Botcake, key, medir, indexado, SESION } = require('./_cliente.cjs');

const PROY = 'mi-bot.json';
const TOPE_PROMPT = 15000; // limite del campo Instrucciones de Botcake (documentacion oficial)
const MARGEN_PROMPT = 14500; // por encima de esto se avisa: casi no queda sitio para ajustes

function uso() {
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').filter((l) => l.startsWith('//')).slice(0, 21).map((l) => l.slice(3)).join('\n'));
  return 1;
}

function opcion(args, nombre, defecto) {
  const i = args.indexOf(nombre);
  if (i === -1) return defecto;
  return args[i + 1];
}

function sinOpciones(args) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) { if (!args[i].includes('=') && args[i] !== '--solo-ver') i++; continue; }
    out.push(args[i]);
  }
  return out;
}

function cargarProyecto() {
  if (!fs.existsSync(PROY)) throw new Error(`No encuentro ${PROY}. Hay que hacer antes las fases 1 a 5.`);
  return JSON.parse(fs.readFileSync(PROY, 'utf8'));
}

function guardarProyecto(p) {
  fs.writeFileSync(PROY + '.tmp', JSON.stringify(p, null, 2));
  fs.renameSync(PROY + '.tmp', PROY);
}

// ---------------------------------------------------------------- sesion
function sesion(args) {
  if (args.length !== 2) {
    console.log('Uso: mibot sesion <llave> <page_id>');
    return 1;
  }
  const llave = args[0].trim().replace(/^[“”"']+|[“”"']+$/g, '');
  const pageId = args[1].trim();
  if (!llave.startsWith('eyJ')) {
    console.log("Esa llave no tiene la forma correcta (deberia empezar por 'eyJ').");
    console.log('Se copio mal, o se copio la clave equivocada. Repetir el paso 3 de la Fase 6.');
    return 1;
  }
  fs.writeFileSync(SESION, JSON.stringify({ token: llave, page_id: pageId }));
  try { fs.chmodSync(SESION, 0o600); } catch (e) { /* Windows no lo soporta; no pasa nada */ }
  let lineas = [];
  if (fs.existsSync('.gitignore')) lineas = fs.readFileSync('.gitignore', 'utf8').split(/\r?\n/);
  for (const e of [SESION, PROY, 'respaldos/']) if (!lineas.includes(e)) lineas.push(e);
  fs.writeFileSync('.gitignore', lineas.filter((l, i, a) => l || i === a.length - 1).join('\n') + '\n');
  console.log(`Sesion guardada en ${SESION} (solo la puede leer tu usuario).`);
  console.log(`Pagina: ${pageId}`);
  return 0;
}

// ---------------------------------------------------------------- lecturas
async function probar(bc) {
  const ts = await bc.etiquetas();
  const r = await bc.get('tags');
  if (r.success === false || !Array.isArray(r.tags)) {
    console.log(`No pude leer la cuenta: ${JSON.stringify(r).slice(0, 200)}`);
    console.log('Revisa 08-cuando-falla.md');
    return 1;
  }
  console.log(`Conexion correcta con la pagina ${bc.pageId}.`);
  console.log(`Etiquetas que ya existen: ${ts.length}`);
  return 0;
}

async function estado(bc) {
  console.log(`PAGINA: ${bc.pageId}\n\nETIQUETAS`);
  for (const t of await bc.etiquetas()) console.log(`  - ${t.name} (id ${t.id})`);
  console.log('\nCAMPOS');
  for (const c of await bc.campos()) console.log(`  - ${c.name} (id ${c.id})`);
  console.log('\nAGENTES');
  for (const a of await bc.agentes()) console.log(`  - ${a.name} (id ${a.id})`);
  return 0;
}

async function verAgente(bc, id) {
  const a = await bc.agente(id);
  if (!a) {
    console.log('No encontre ese agente. Comprueba el numero en la direccion de la pantalla.');
    return 1;
  }
  const p = (a.instructions || {}).general_prompt || '';
  console.log(`Agente: ${a.name}`);
  console.log(`Modelo: ${a.model}`);
  console.log(`Caracteres del prompt: ${medir(p)}`);
  console.log(`Archivos de conocimiento enganchados: ${(a.files_library || []).length}`);
  console.log(`Datos que extrae a campos: ${((a.settings || {}).informations || []).length}`);
  console.log('\nPrimeras lineas del prompt que tiene ahora:');
  for (const l of p.split('\n').slice(0, 6)) console.log(`  | ${l}`);
  if (!p.trim()) {
    console.log('\n>>> EL PROMPT ESTA VACIO. No se guardo. Repetir el paso 8.');
    return 1;
  }
  return 0;
}

async function verConocimiento(bc, id, frase) {
  const a = await bc.agente(id);
  const archivos = (a && a.files_library) || [];
  if (!archivos.length) {
    console.log('>>> El agente NO tiene ningun archivo de conocimiento. Repetir el paso 9.');
    return 1;
  }
  let ok = false;
  for (const f of archivos) {
    let txt;
    try { txt = await (await fetch(f.path)).text(); } catch (e) {
      console.log(`  - ${f.name}: no pude descargarlo (${e.message})`);
      continue;
    }
    const tiene = txt.toLowerCase().includes(frase.toLowerCase());
    console.log(`  - ${f.name}: ${txt.length} caracteres | indexado: ${indexado(f) ? 'SI' : 'NO'} | contiene la frase: ${tiene ? 'SI' : 'NO'}`);
    ok = ok || (tiene && indexado(f));
  }
  if (!ok) {
    console.log('\n>>> Ningun archivo indexado del agente contiene esa frase.');
    console.log('    Se subio pero no se guardo, o quedo marcado el archivo viejo. Repetir el paso 9.');
    return 1;
  }
  console.log('\nEl archivo entro de verdad.');
  return 0;
}

// ---------------------------------------------------------------- prompt
function medirArchivo(ruta) {
  const t = fs.readFileSync(ruta, 'utf8');
  const n = medir(t);
  console.log(`Caracteres (como los cuenta Botcake): ${n} de ${TOPE_PROMPT}`);
  if (n > TOPE_PROMPT) {
    console.log(`>>> SE PASA por ${n - TOPE_PROMPT}. Botcake lo corta. Mueve datos a la base de conocimiento.`);
    return 1;
  }
  if (n > MARGEN_PROMPT) console.log(`Aviso: quedan solo ${TOPE_PROMPT - n} de margen para ajustes.`);
  else console.log('Cabe.');
  return 0;
}

async function ponerPrompt(bc, id, ruta, tope) {
  const texto = fs.readFileSync(ruta, 'utf8');
  const n = medir(texto);
  if (n > tope) {
    console.log(`>>> El prompt tiene ${n} caracteres y el tope es ${tope}. No se escribe.`);
    console.log('    Mueve datos (precios, horarios, FAQs) a la base de conocimiento y repite.');
    return 1;
  }
  const r = await bc.ponerPrompt(id, texto);
  console.log(`Prompt escrito. Caracteres en el archivo: ${n} | en el agente: ${r.plano} (texto) / ${r.slate} (editor)`);
  if (Math.abs(r.plano - n) > 5 || !r.iguales) {
    console.log('>>> NO coincide. El prompt no quedo bien en los dos campos. Revisar 08-cuando-falla.md');
    return 1;
  }
  if (r.vector_antes && r.vector_antes !== r.vector_ahora) {
    console.log(`Aviso: el indice de la base de conocimiento cambio (${r.vector_antes} -> ${r.vector_ahora}). Es normal si hubo que restaurarlo.`);
  }
  console.log(`Coincide. Archivos de conocimiento que siguen enganchados: ${r.archivos}`);
  console.log('>>> AL FINAL DEL MONTAJE, EN LA INTERFAZ: abre el agente y deja el modo en «Detalle».');
  console.log('    Escribir por comando puede cambiarlo aunque no se toque: se revisa siempre.');
  return 0;
}

// ---------------------------------------------------------------- KB
async function subirKb(bc, id, ruta, frase) {
  let f;
  try {
    f = await bc.adjuntarKb(id, ruta);
  } catch (e) {
    console.log(`>>> ${e.message}`);
    return 1;
  }
  if (!f) {
    console.log('>>> El archivo quedo adjunto pero NO indexado tras 48 segundos.');
    console.log('    Sin openai_file_id + cake_ai_file_id (dentro de meta_data) el bot NO lo lee.');
    console.log('    Espera un minuto y comprueba con: mibot ver-conocimiento <id> "<frase>"');
    return 1;
  }
  console.log(`Archivo adjunto e indexado: ${f.name} (id ${f.id})`);
  if (frase) {
    const r = await verConocimiento(bc, id, frase);
    if (r) return r;
  }
  console.log('\nSi habia una version vieja del archivo, quitala con un segundo guardado (ver 06-montaje.md, paso 9).');
  return 0;
}

// ---------------------------------------------------------------- extraccion
async function extraerDatos(bc, id) {
  const p = cargarProyecto();
  const datos = (p.estilo || {}).datos_a_capturar || [];
  const lista = datos.filter((d) => d && typeof d === 'object' && d.campo && d.instruccion);
  if (!lista.length) {
    console.log('En mi-bot.json, estilo.datos_a_capturar tiene que ser una lista de objetos');
    console.log('  {"campo": "Nombre", "instruccion": "El primer nombre del cliente. Si no lo dijo, vacio."}');
    return 1;
  }
  const largos = lista.filter((d) => d.instruccion.length > 200);
  if (largos.length) {
    for (const d of largos) console.log(`>>> La instruccion de '${d.campo}' tiene ${d.instruccion.length} caracteres; el maximo es 200.`);
    return 1;
  }
  const campos = await bc.asegurarCampos(lista.map((d) => d.campo));
  const items = lista.map((d) => ({
    custom_field_id: campos[d.campo],
    desc_obj: { description: d.instruccion, type: 'string' },
    is_active: true,
    sync_crm: null, sync_crm_index: null, sync_crm_label: null,
  }));
  const n = await bc.ponerExtraccion(id, items);
  p.montaje = p.montaje || {};
  p.montaje.campos = Object.assign(p.montaje.campos || {}, campos);
  p.montaje.extraccion = n === items.length;
  guardarProyecto(p);
  console.log(`Extraccion configurada: ${n} de ${items.length} datos.`);
  for (const d of lista) console.log(`  - ${d.campo} (campo ${campos[d.campo]}): "${d.instruccion}"`);
  if (n !== items.length) {
    console.log('>>> No quedaron todos. Revisar con: mibot ver-agente ' + id);
    return 1;
  }
  console.log('>>> Recuerda: al final del montaje, dejar el modo del agente en «Detalle» (interfaz).');
  return 0;
}

// ---------------------------------------------------------------- prueba rapida
async function preguntar(bc, id, mensaje) {
  const r = await bc.preguntarAgente(id, mensaje);
  if (r.success === false) {
    console.log(`>>> No respondio: ${JSON.stringify(r).slice(0, 300)}`);
    return 1;
  }
  const partes = [];
  const recorrer = (x) => {
    if (!x || typeof x !== 'object') return;
    if (Array.isArray(x)) return x.forEach(recorrer);
    if (x.plugin_id === 'text' && x.config && x.config.text) partes.push(x.config.text);
    else if (x.plugin_id === 'image' && x.config && x.config.url) partes.push(`[imagen: ${x.config.url}]`);
    else Object.values(x).forEach(recorrer);
  };
  recorrer(r);
  console.log(`Pregunta: "${mensaje}"`);
  if (partes.length) {
    console.log('Respuesta del agente:');
    for (const t of partes) console.log(`  | ${t}`);
  } else {
    console.log('Respuesta (en crudo):');
    console.log(JSON.stringify(r, null, 1).slice(0, 2000));
  }
  return 0;
}

// ---------------------------------------------------------------- respuestas
async function respuestas(bc, buscar) {
  const p = fs.existsSync(PROY) ? cargarProyecto() : {};
  const nombres = new Map((await bc.campos()).map((c) => [String(c.id), c.name]));
  const lista = await bc.clientes(1, 20);
  if (!lista.length) {
    console.log('No hay clientes recientes en esta pagina (o el endpoint devolvio vacio).');
    return 1;
  }
  const q = (buscar || '').toLowerCase().replace(/\s+/g, '');
  const cand = q
    ? lista.filter((c) => `${c.full_name || ''}${c.phone_number || ''}${c.name || ''}`.toLowerCase().replace(/\s+/g, '').includes(q))
    : lista.slice(0, 3);
  if (!cand.length) {
    console.log(`No encontre a nadie que coincida con "${buscar}" entre los ultimos 20 clientes:`);
    for (const c of lista) console.log(`  - ${c.full_name || c.name || '?'} ${c.phone_number || ''} (id ${c.id})`);
    return 1;
  }
  for (const c of cand) {
    const info = await bc.clienteInfo(c.id);
    console.log(`\n${c.full_name || c.name || '?'} ${c.phone_number || ''} (id ${c.id})`);
    if (!info) { console.log('  (sin informacion)'); continue; }
    const tags = (info.tags || []).map((t) => (typeof t === 'object' ? t.name || t.text || t.label || JSON.stringify(t) : t));
    console.log(`  Etiquetas: ${tags.length ? tags.join(', ') : 'ninguna'}`);
    for (const f of info.fields || []) {
      if (f.value == null || f.value === '') continue;
      console.log(`  ${nombres.get(String(f.id)) || 'campo ' + f.id}: ${String(f.value).replace(/\n/g, ' / ')}`);
    }
  }
  void p;
  return 0;
}

// ---------------------------------------------------------------- montar
function texto(k, t) {
  return { key: k, plugin_id: 'text', config: { text: t, rawText: [{ type: 'paragraph', children: [{ text: t }] }], buttons: [] } };
}

function construir(agenteId, campoPreg, campoResp, tagBot, tagAsesor, ramas) {
  const [kIni, kPuerta, kStop, kAi, kRouter, kBucle] = [key(), key(), key(), key(), key(), key()];
  const bloques = [];
  const x = 100, y = 100;

  // Entrada: solo etiqueta (sin active_gpt: reactivaria la IA de un cliente ya escalado).
  bloques.push({ key: kIni, type: 'action', title: 'Inicio', collapsed: false, cards: [],
    action: [{ action: 'add_tag', action_id: [tagBot] }],
    coordinate: { coordinateX: x, coordinateY: y },
    gotos: { block_key: kPuerta, block_type: 'condition', type: 'blocks' } });

  // Puerta: si ya lo atiende una persona, no contestar.
  bloques.push({ key: kPuerta, type: 'condition', title: 'Ya lo atiende una persona?', collapsed: false,
    cards: [{ key: key(), type: 'and', config: {},
      condition: [{ filter_type: 'equal', title: 'Tag', type: 'tags', tags: [{ label: 'Asesor', page_id: null, tag_id: tagAsesor }] }],
      gotos: { block_key: kStop, block_type: 'action', type: 'blocks' } }],
    coordinate: { coordinateX: x + 320, coordinateY: y },
    defaultGotos: { block_key: kAi, type: 'blocks' } });

  bloques.push({ key: kStop, type: 'action', title: 'No contestar', collapsed: false, cards: [],
    action: [{ action: 'deactivate_gpt' }],
    coordinate: { coordinateX: x + 320, coordinateY: y + 260 }, gotos: {} });

  // El agente. customer_question lleva el campo del bucle Y la ultima entrada de texto:
  // en el primer turno el mensaje no pasa por el bucle y el campo esta vacio.
  bloques.push({ key: kAi, type: 'AI', title: 'El agente contesta', next_step: true, collapsed: false,
    cards: [{ id: 0, key: key(), type: 'default', config: {},
      gotos: { block_key: kRouter, block_type: 'condition', type: 'blocks' } }],
    config: { selected_agent: agenteId,
      customer_question: `{{${campoPreg}//Pregunta Cliente}}\n{{last_text_input}}`,
      save_res_to_field_id: campoResp,
      list_products: [], list_products_enabled: false,
      additional_instructions: '', additional_instructions_enabled: false, typing_indicator: false },
    coordinate: { coordinateX: x + 640, coordinateY: y },
    defaultGotos: { block_key: kBucle, type: 'blocks' } });

  const cards = [], extra = [];
  ramas.forEach((r, i) => {
    const kAcc = key();
    let destino = kAcc, tipo = 'action';
    if (r.mensaje) {
      const kMsg = key();
      extra.push({ key: kMsg, type: null, title: `Mensaje ${r.etiqueta}`, next_step: true, collapsed: false,
        cards: [texto(key(), r.mensaje)],
        coordinate: { coordinateX: x + 960, coordinateY: y + 200 * i },
        gotos: { block_key: kAcc, block_type: 'action', type: 'blocks' } });
      destino = kMsg; tipo = null;
    }
    const frase = r.frase;
    const variantes = [...new Set([frase, frase[0].toUpperCase() + frase.slice(1).toLowerCase(), frase.toLowerCase()])];
    cards.push({ key: key(), type: 'and', config: {},
      condition: [
        { cuf_id: campoResp, cuf_type: 1, filter_type: 'contains', label: 'Respuesta IA', title: 'Respuesta IA', type: 'cuf', value: null, values: variantes },
        { filter_type: 'not_equal', title: 'Tag', type: 'tags', tags: [{ label: r.etiqueta, page_id: null, tag_id: r.tag_id }] },
      ],
      gotos: { block_key: destino, block_type: tipo, type: 'blocks' } });
    const acciones = [{ action: 'add_tag', action_id: [r.tag_id] }];
    if (r.apaga_agente) acciones.push({ action: 'deactivate_gpt' });
    extra.push({ key: kAcc, type: 'action', title: r.etiqueta, collapsed: false, cards: [], action: acciones,
      coordinate: { coordinateX: x + 1280, coordinateY: y + 200 * i },
      gotos: r.apaga_agente ? {} : { block_key: kBucle, block_type: null, type: 'blocks' } });
  });

  bloques.push({ key: kRouter, type: 'condition', title: 'Revisor', collapsed: false, cards,
    coordinate: { coordinateX: x + 960, coordinateY: y - 200 },
    defaultGotos: { block_key: kBucle, type: 'blocks' } });
  bloques.push(...extra);

  // Bucle: espera el siguiente mensaje y vuelve a la PUERTA (no al agente), para que una
  // conversacion que paso a una persona a mitad de camino no reciba bot.
  bloques.push({ key: kBucle, type: null, title: 'Bucle', next_step: true, collapsed: false,
    cards: [{ id: 0, key: key(), is_valid: false, plugin_id: 'user_input',
      config: { customFieldType: 1, custom_field_id: campoPreg, preferred_language: 'es', reply_type: 'text',
        retry_message: '', run_keyword_if_void: true, skip_btn: '', text: '' },
      add_actions: [], quick_reply_user_input: [{ title: '' }] }],
    coordinate: { coordinateX: x + 640, coordinateY: y + 400 },
    gotos: { block_key: kPuerta, block_type: 'condition', type: 'blocks' } });
  return bloques;
}

async function montar(args) {
  const soloVer = args.includes('--solo-ver');
  const p = cargarProyecto();
  const m = p.montaje || (p.montaje = {});
  const agenteId = m.agente_id;
  if (!agenteId) throw new Error('Falta el numero del agente en mi-bot.json (paso 7 de la Fase 7).');
  const ramas = ((p.flujo || {}).ramas) || [];
  if (!ramas.length) throw new Error("No hay ramas definidas en mi-bot.json (seccion 'flujo').");
  for (const r of ramas) {
    if (!r.frase || !r.etiqueta) throw new Error('Cada rama necesita "frase" y "etiqueta".');
    if (r.etiqueta.length > 15) throw new Error(`La etiqueta '${r.etiqueta}' pasa de 15 caracteres.`);
  }
  const nombre = (p.flujo || {}).nombre || `Bot ${(p.negocio || {}).nombre || ''}`.trim();

  if (soloVer) {
    ramas.forEach((r, i) => { r.tag_id = 1000 + i; });
    const bloques = construir(agenteId, 1, 2, 10, 11, ramas);
    console.log(`Flujo '${nombre}' — ${bloques.length} pasos (sin tocar Botcake):`);
    for (const b of bloques) console.log(`  - ${b.title}`);
    return 0;
  }

  const bc = new Botcake();
  // Espejo prompt <-> revisor: cada frase ancla tiene que estar escrita identica en el prompt.
  const a = await bc.agente(agenteId);
  if (!a) throw new Error(`No encontre el agente ${agenteId} en esta pagina.`);
  const prompt = (a.instructions || {}).general_prompt || '';
  const rotas = ramas.filter((r) => !prompt.includes(r.frase)).map((r) => r.frase);
  if (rotas.length) {
    console.log('>>> Estas frases ancla NO estan escritas tal cual en el prompt del agente:');
    for (const f of rotas) console.log(`    - ${f}`);
    console.log('    El revisor nunca las veria. Corrige el prompt (paso 8) o la rama, y repite.');
    return 1;
  }

  const campos = await bc.asegurarCampos(['Pregunta Cliente', 'Respuesta IA']);
  const specs = [['Bot', '#95a5a6'], ['Asesor', '#e74c3c'], ...ramas.map((r) => [r.etiqueta, r.color || '#7B2D8E'])];
  const tags = await bc.asegurarEtiquetas(specs);
  for (const r of ramas) r.tag_id = tags[r.etiqueta];

  const flujoId = m.flujo_id || (await bc.crearFlujo(nombre));
  const bloques = construir(agenteId, campos['Pregunta Cliente'], campos['Respuesta IA'], tags.Bot, tags.Asesor, ramas);
  await bc.guardarFlujo(flujoId, nombre, bloques);

  const leido = await bc.flujo(flujoId);
  const puestos = ((leido.drafts || {}).blocks) || [];
  Object.assign(m, { flujo_id: flujoId, etiquetas: tags, campos: Object.assign(m.campos || {}, campos),
    punto_de_entrada: false, encendido: false });
  guardarProyecto(p);

  console.log(`Flujo '${nombre}' (numero ${flujoId})`);
  console.log(`Pasos que quedaron montados: ${puestos.length}`);
  for (const b of puestos) console.log(`  - ${b.title || b.key}`);
  console.log('\nRamas del revisor:');
  for (const r of ramas) console.log(`  - cuando el agente escriba '${r.frase}' -> etiqueta '${r.etiqueta}'${r.apaga_agente ? ' y se apaga' : ''}`);
  if (puestos.length !== bloques.length) {
    console.log(`\n>>> OJO: se enviaron ${bloques.length} pasos y quedaron ${puestos.length}. Revisar 08-cuando-falla.md`);
    return 1;
  }
  console.log('\nEl bot esta montado y APAGADO: todavia no tiene punto de entrada.');
  return 0;
}

// ---------------------------------------------------------------- main
async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) return uso();
  const cmd = argv[0];
  const args = sinOpciones(argv.slice(1));

  if (cmd === 'sesion') return sesion(args);
  if (cmd === 'medir') return args[0] ? medirArchivo(args[0]) : uso();
  if (cmd === 'montar') return montar(argv.slice(1));

  const bc = new Botcake();
  switch (cmd) {
    case 'probar': return probar(bc);
    case 'estado': return estado(bc);
    case 'respaldo': {
      const r = await bc.respaldo();
      console.log(`Respaldo de ${r.agentes} agente(s) y la lista de flujos en ${r.ruta}`);
      return 0;
    }
    case 'crear-etiqueta': {
      const t = await bc.crearEtiqueta(args[0], args[1] || '#7B2D8E');
      console.log(`Etiqueta '${t.name}' -> id ${t.id}`);
      return 0;
    }
    case 'crear-campo': {
      const ids = await bc.asegurarCampos([args[0]]);
      console.log(`Campo '${args[0]}' -> id ${ids[args[0]]}`);
      return 0;
    }
    case 'poner-prompt': return ponerPrompt(bc, args[0], args[1], Number(opcion(argv, '--tope', TOPE_PROMPT)));
    case 'subir-kb': return subirKb(bc, args[0], args[1], args[2]);
    case 'extraer-datos': return extraerDatos(bc, args[0]);
    case 'ver-agente': return verAgente(bc, args[0]);
    case 'ver-conocimiento': return verConocimiento(bc, args[0], args[1] || '');
    case 'preguntar': return preguntar(bc, args[0], args.slice(1).join(' '));
    case 'palabras': {
      const ps = await bc.palabras();
      if (!ps.length) { console.log('No hay palabras clave en esta pagina (o el endpoint devolvio vacio).'); return 0; }
      for (const k of ps) console.log(JSON.stringify(k));
      return 0;
    }
    case 'borrar-palabra': {
      await bc.borrarPalabra(args[0]);
      const quedan = (await bc.palabras()).filter((k) => String(k.id) === String(args[0]));
      if (quedan.length) { console.log(`>>> La palabra clave ${args[0]} SIGUE existiendo. No se borro.`); return 1; }
      console.log(`Palabra clave ${args[0]} borrada y comprobada.`);
      return 0;
    }
    case 'respuestas': return respuestas(bc, args.join(' '));
    default: return uso();
  }
}

main().then((c) => process.exit(c || 0)).catch((e) => {
  console.log(`>>> ${e.message}`);
  process.exit(1);
});
