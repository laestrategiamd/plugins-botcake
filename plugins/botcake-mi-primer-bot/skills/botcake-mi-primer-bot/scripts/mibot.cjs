#!/usr/bin/env node
// El unico comando del plugin. Se corre desde la carpeta del proyecto del usuario
// (donde viven mi-bot.json y .botcake-sesion).
//
//   mibot sesion <llave> [page_id]                guarda la llave de sesion (Fase 6)
//   mibot paginas                                 lista las paginas de la cuenta
//   mibot pagina <page_id>                        elige la pagina con la que se trabaja
//   mibot probar                                  comprueba la conexion
//   mibot estado                                  lista etiquetas, campos y agentes
//   mibot respaldo                                baja los agentes a disco (antes de escribir)
//   mibot crear-etiqueta "Asesor" "#e74c3c"
//   mibot crear-campo "Nombre"
//   mibot medir <archivo.txt>                     cuenta los caracteres de un prompt
//   mibot poner-prompt <agente_id> <archivo.txt> [--tope 15000]
//   mibot extraer-datos <agente_id>               configura la extraccion (de mi-bot.json)
//   mibot subir-kb <agente_id> <archivo.txt> ["frase que tiene que estar"]
//   mibot quitar-kb <agente_id> <id_del_archivo_viejo>
//   mibot ver-agente <agente_id>
//   mibot ver-conocimiento <agente_id> "frase que tiene que estar"
//   mibot preguntar <agente_id> "mensaje"         prueba rapida sin navegador (cuesta centavos)
//   mibot montar [--solo-ver]                     construye el flujo desde mi-bot.json
//   mibot verificar [--encendido]                 comprueba lo montado (y repara el indice)
//   mibot palabras
//   mibot borrar-palabra <id>
//   mibot respuestas ["nombre o telefono"]        que respondio el bot y que etiquetas puso
//
// Confirmacion de pedidos (lee y escribe mi-confirmacion.json):
//   mibot plantillas                              plantillas de WhatsApp y su estado en Meta
//   mibot crear-plantillas                        manda a Meta las dos plantillas aprobadas
//   mibot confirmacion [--solo-ver]               monta etiquetas, flujos y secuencia, APAGADA
//   mibot verificar-confirmacion [--encendido]    comprueba lo montado paso por paso
//   mibot encender-confirmacion                   enciende los 3 pasos (solo con un si del usuario)
//   mibot apagar-confirmacion                     los apaga
'use strict';
const fs = require('fs');
const path = require('path');
const { Botcake, key, medir, deSlate, indexado, dormir, SESION } = require('./_cliente.cjs');

const PROY = 'mi-bot.json';
const TOPE_PROMPT = 15000; // limite del campo Instrucciones de Botcake (documentacion oficial)
const MARGEN_PROMPT = 14500; // por encima de esto se avisa: casi no queda sitio para ajustes

function uso() {
  const lineas = [];
  for (const l of fs.readFileSync(__filename, 'utf8').split('\n').slice(1)) {
    if (!l.startsWith('//')) break;
    lineas.push(l.slice(3));
  }
  console.log(lineas.join('\n'));
  return 1;
}

function opcion(args, nombre, defecto) {
  const i = args.indexOf(nombre);
  if (i === -1) return defecto;
  return args[i + 1];
}

const SIN_VALOR = ['--solo-ver', '--encendido'];

function sinOpciones(args) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) { if (!args[i].includes('=') && !SIN_VALOR.includes(args[i])) i++; continue; }
    out.push(args[i]);
  }
  return out;
}

function cargarProyecto() {
  if (!fs.existsSync(PROY)) throw new Error(`No encuentro ${PROY}. Hay que hacer antes las fases 1 a 5.`);
  return JSON.parse(fs.readFileSync(PROY, 'utf8'));
}

function guardarProyecto(p, archivo = PROY) {
  fs.writeFileSync(archivo + '.tmp', JSON.stringify(p, null, 2));
  fs.renameSync(archivo + '.tmp', archivo);
}

// ---------------------------------------------------------------- sesion
function sesion(args) {
  if (args.length < 1 || args.length > 2) {
    console.log('Uso: mibot sesion <llave> [page_id]');
    return 1;
  }
  const llave = args[0].trim().replace(/^[“”"']+|[“”"']+$/g, '');
  const pageId = (args[1] || '').trim();
  if (!llave.startsWith('eyJ')) {
    console.log("Esa llave no tiene la forma correcta (deberia empezar por 'eyJ').");
    console.log('Se copio mal, o se copio la clave equivocada. Repetir el paso 3 de la Fase 6.');
    return 1;
  }
  // Si la llave caduco y se vuelve a guardar, se conserva la pagina que ya estaba elegida.
  let previa = {};
  try { previa = JSON.parse(fs.readFileSync(SESION, 'utf8')); } catch (e) { /* no habia sesion */ }
  const pag = pageId || previa.page_id || '';
  fs.writeFileSync(SESION, JSON.stringify({ token: llave, page_id: pag }));
  try { fs.chmodSync(SESION, 0o600); } catch (e) { /* Windows no lo soporta; no pasa nada */ }
  let lineas = [];
  if (fs.existsSync('.gitignore')) lineas = fs.readFileSync('.gitignore', 'utf8').split(/\r?\n/);
  for (const e of [SESION, PROY, 'respaldos/']) if (!lineas.includes(e)) lineas.push(e);
  fs.writeFileSync('.gitignore', lineas.filter((l, i, a) => l || i === a.length - 1).join('\n') + '\n');
  console.log(`Sesion guardada en ${SESION} (solo la puede leer tu usuario).`);
  if (pag) console.log(`Pagina: ${pag}`);
  else console.log('Falta elegir la pagina: corre "mibot paginas" y despues "mibot pagina <identificador>".');
  return 0;
}

// ---------------------------------------------------------------- paginas
async function paginas() {
  const bc = new Botcake({ sinPagina: true });
  const r = await bc.listarPaginas();
  const lista = Array.isArray(r) ? r : (r.pages || r.data || []);
  if (!Array.isArray(lista) || !lista.length) {
    console.log(`No pude leer las paginas: ${JSON.stringify(r).slice(0, 200)}`);
    console.log('Revisa 08-cuando-falla.md (llave caducada o copiada mal).');
    return 1;
  }
  console.log('Paginas de esta cuenta:');
  for (const pg of lista) {
    console.log(`  - ${pg.name || pg.page_name || '(sin nombre)'} | identificador: ${pg.id || pg.page_id} | ${pg.platform || ''}`);
  }
  console.log('\nElige la del bot con: mibot pagina <identificador>');
  return 0;
}

function pagina(args) {
  if (args.length !== 1) { console.log('Uso: mibot pagina <identificador>'); return 1; }
  let d;
  try { d = JSON.parse(fs.readFileSync(SESION, 'utf8')); } catch (e) {
    console.log('Primero hay que guardar la llave: mibot sesion "<llave>"');
    return 1;
  }
  d.page_id = args[0].trim();
  fs.writeFileSync(SESION, JSON.stringify(d));
  try { fs.chmodSync(SESION, 0o600); } catch (e) { /* Windows no lo soporta */ }
  console.log(`Pagina elegida: ${d.page_id}. Comprueba con: mibot probar`);
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
  const archivos = a.files_library || [];
  console.log(`Archivos de conocimiento enganchados: ${archivos.length}`);
  for (const f of archivos) console.log(`  - ${f.name} | id ${f.id} | indice: ${indexado(f) ? 'SI' : 'NO (el bot no lo lee)'}`);
  console.log(`Datos que extrae a campos: ${((a.settings || {}).informations || []).length}`);
  console.log('\nPrimeras lineas del prompt que tiene ahora:');
  for (const l of p.split('\n').slice(0, 6)) console.log(`  | ${l}`);
  if (!p.trim()) {
    console.log('\n>>> EL PROMPT ESTA VACIO. No se guardo. Repetir el paso 6 de 06-montaje.md.');
    return 1;
  }
  return 0;
}

async function verConocimiento(bc, id, frase) {
  const a = await bc.agente(id);
  const archivos = (a && a.files_library) || [];
  if (!archivos.length) {
    console.log('>>> El agente NO tiene ningun archivo de conocimiento. Repetir el paso 8 de 06-montaje.md.');
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
    console.log('    Se subio pero no se guardo, o quedo marcado el archivo viejo. Repetir el paso 8 de 06-montaje.md.');
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
  if (avisarIndice(r.indice)) return 1;
  console.log('>>> AL FINAL DEL MONTAJE, EN LA INTERFAZ: abre el agente y deja el modo en «Detalle».');
  console.log('    Escribir por comando puede cambiarlo aunque no se toque: se revisa siempre.');
  return 0;
}

// ---------------------------------------------------------------- KB
// Despues de cualquier escritura en el agente: si algun archivo quedo sin indice, avisa.
function avisarIndice(ind) {
  if (!ind) return false;
  if (ind.sinIndice.length) {
    console.log(`>>> OJO: ${ind.sinIndice.length} archivo(s) de conocimiento quedaron SIN indice: ${ind.sinIndice.join(', ')}`);
    console.log('    El bot no los lee. Espera un minuto y corre: mibot verificar');
    return true;
  }
  if (ind.reparado) console.log('El indice de la base de conocimiento se cayo al escribir y se recupero solo.');
  return false;
}

async function quitarKb(bc, id, archivoId) {
  let r;
  try { r = await bc.quitarKb(id, archivoId); } catch (e) {
    console.log(`>>> ${e.message}`);
    return 1;
  }
  console.log(`Archivo ${archivoId} quitado del agente. Quedan ${r.quedan} archivo(s).`);
  if (avisarIndice(r.indice)) return 1;
  return 0;
}

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
  if (avisarIndice(f._indice)) return 1;
  if (frase) {
    const r = await verConocimiento(bc, id, frase);
    if (r) return r;
  }
  console.log('\nSi habia una version vieja del archivo, quitala con: mibot quitar-kb <agente_id> <id del archivo viejo>');
  console.log('(los ids salen en: mibot ver-agente <agente_id>)');
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
  const { n, indice } = await bc.ponerExtraccion(id, items);
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
  if (avisarIndice(indice)) return 1;
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

const MENSAJE_REINTENTO = 'Disculpa, no alcancé a entender tu mensaje. ¿Me lo escribes de nuevo con otras palabras?';
const MENSAJE_TRASPASO = 'En un momento te escribe alguien del equipo.';

function construir(agenteId, campoPreg, campoResp, tagBot, tagAsesor, tagFallo, ramas, textos = {}) {
  const [kIni, kPuerta, kStop, kAi, kRouter, kBucle] = [key(), key(), key(), key(), key(), key()];
  const [kLimpia, kFallo, kMsgRepite, kMarca, kMsgEscala, kEscala] = [key(), key(), key(), key(), key(), key()];
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
      gotos: { block_key: kLimpia, block_type: 'action', type: 'blocks' } }],
    config: { selected_agent: agenteId,
      customer_question: `{{${campoPreg}//Pregunta Cliente}}\n{{last_text_input}}`,
      save_res_to_field_id: campoResp,
      list_products: [], list_products_enabled: false,
      additional_instructions: '', additional_instructions_enabled: false, typing_indicator: false },
    coordinate: { coordinateX: x + 640, coordinateY: y },
    // Salida de error del agente (no pudo contestar): va al techo de reintentos, no al bucle.
    defaultGotos: { block_key: kFallo, type: 'blocks' } });

  // Si el agente contesto, se borra la marca de fallo: el techo cuenta fallos SEGUIDOS.
  bloques.push({ key: kLimpia, type: 'action', title: 'Contesto bien', collapsed: false, cards: [],
    action: [{ action: 'remove_tag', action_id: [tagFallo] }],
    coordinate: { coordinateX: x + 640, coordinateY: y - 260 },
    gotos: { block_key: kRouter, block_type: 'condition', type: 'blocks' } });

  // Techo de reintentos: al primer fallo pide que repita; al segundo seguido pasa a una persona.
  // Sin esto, si la IA falla el cliente no recibe nada y nadie se entera.
  bloques.push({ key: kFallo, type: 'condition', title: 'Ya fallo antes?', collapsed: false,
    cards: [{ key: key(), type: 'and', config: {},
      condition: [{ filter_type: 'equal', title: 'Tag', type: 'tags', tags: [{ label: 'IA sin resp', page_id: null, tag_id: tagFallo }] }],
      gotos: { block_key: kMsgEscala, block_type: null, type: 'blocks' } }],
    coordinate: { coordinateX: x, coordinateY: y + 520 },
    defaultGotos: { block_key: kMsgRepite, type: 'blocks' } });
  bloques.push({ key: kMsgRepite, type: null, title: 'Pide que repita', next_step: true, collapsed: false,
    cards: [texto(key(), textos.reintento || MENSAJE_REINTENTO)],
    coordinate: { coordinateX: x, coordinateY: y + 780 },
    gotos: { block_key: kMarca, block_type: 'action', type: 'blocks' } });
  bloques.push({ key: kMarca, type: 'action', title: 'Marca el fallo', collapsed: false, cards: [],
    action: [{ action: 'add_tag', action_id: [tagFallo] }],
    coordinate: { coordinateX: x + 320, coordinateY: y + 780 },
    gotos: { block_key: kBucle, block_type: null, type: 'blocks' } });
  bloques.push({ key: kMsgEscala, type: null, title: 'Pasa a una persona', next_step: true, collapsed: false,
    cards: [texto(key(), textos.traspaso || MENSAJE_TRASPASO)],
    coordinate: { coordinateX: x, coordinateY: y + 1040 },
    gotos: { block_key: kEscala, block_type: 'action', type: 'blocks' } });
  bloques.push({ key: kEscala, type: 'action', title: 'Asesor por fallo', collapsed: false, cards: [],
    action: [{ action: 'add_tag', action_id: [tagAsesor] }, { action: 'deactivate_gpt' }],
    coordinate: { coordinateX: x + 320, coordinateY: y + 1040 }, gotos: {} });

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
  if (!agenteId) throw new Error('Falta el numero del agente en mi-bot.json (paso 5 de 06-montaje.md).');
  const ramas = ((p.flujo || {}).ramas) || [];
  if (!ramas.length) throw new Error("No hay ramas definidas en mi-bot.json (seccion 'flujo').");
  for (const r of ramas) {
    if (!r.frase || !r.etiqueta) throw new Error('Cada rama necesita "frase" y "etiqueta".');
    if (r.etiqueta.length > 15) throw new Error(`La etiqueta '${r.etiqueta}' pasa de 15 caracteres.`);
  }
  const nombre = (p.flujo || {}).nombre || `Bot ${(p.negocio || {}).nombre || ''}`.trim();
  const escala = ramas.find((r) => r.apaga_agente && r.mensaje);
  const textos = {
    reintento: (p.flujo || {}).mensaje_reintento || '',
    traspaso: (escala && escala.mensaje) || (p.escalado || {}).mensaje_de_traspaso || '',
  };

  if (soloVer) {
    ramas.forEach((r, i) => { r.tag_id = 1000 + i; });
    const bloques = construir(agenteId, 1, 2, 10, 11, 12, ramas, textos);
    console.log(`Flujo '${nombre}': ${bloques.length} pasos (sin tocar Botcake):`);
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
    console.log('    El revisor nunca las veria. Corrige el prompt (paso 6 de 06-montaje.md) o la rama, y repite.');
    return 1;
  }

  const campos = await bc.asegurarCampos(['Pregunta Cliente', 'Respuesta IA']);
  const specs = [['Bot', '#95a5a6'], ['Asesor', '#e74c3c'], ['IA sin resp', '#f39c12'],
    ...ramas.map((r) => [r.etiqueta, r.color || '#7B2D8E'])];
  const { ids: tags, reutilizadas } = await bc.asegurarEtiquetas(specs);
  if (reutilizadas.includes('Asesor')) {
    console.log('Aviso: la etiqueta "Asesor" ya existia en esta pagina. Los contactos que ya la tienen');
    console.log('  NO van a recibir respuesta del bot: para el flujo, ya los atiende una persona.');
  }
  for (const r of ramas) r.tag_id = tags[r.etiqueta];

  const flujoId = m.flujo_id || (await bc.crearFlujo(nombre));
  const bloques = construir(agenteId, campos['Pregunta Cliente'], campos['Respuesta IA'], tags.Bot, tags.Asesor,
    tags['IA sin resp'], ramas, textos);
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
  console.log('Siguiente: publicar el flujo en el editor y correr mibot verificar (06-montaje.md, pasos 10 y 11).');
  return 0;
}

// ---------------------------------------------------------------- verificar
// Comprueba por API lo que antes se miraba a ojo. Se corre al cerrar el montaje y otra vez
// antes de encender; con --encendido exige tambien la Respuesta predeterminada.
async function verificar(bc, argv) {
  const conEntrada = argv.includes('--encendido');
  const tope = Number(opcion(argv, '--tope', TOPE_PROMPT));
  const p = cargarProyecto();
  const m = p.montaje || {};
  const filas = [];
  const fila = (ok, que, detalle) => filas.push({ ok, que, detalle });

  const a = m.agente_id ? await bc.agente(m.agente_id) : null;
  if (!a) {
    fila(false, 'Agente', m.agente_id ? `no encontre el agente ${m.agente_id}` : 'falta montaje.agente_id en mi-bot.json');
  } else {
    const ins = a.instructions || {};
    const plano = ins.general_prompt || '';
    const iguales = plano.trim() === deSlate(ins.slate_general_prompt).trim();
    const n = medir(plano);
    fila(n > 0 && n <= tope && iguales, 'Prompt',
      `${n} caracteres (tope ${tope}), los dos campos ${iguales ? 'iguales' : 'DISTINTOS'}`);
    const esperados = ((p.estilo || {}).datos_a_capturar || []).filter((d) => d && d.campo && d.instruccion).length;
    const puestos = ((a.settings || {}).informations || []).length;
    fila(puestos >= esperados, 'Extraccion de datos', `${puestos} configurados de ${esperados} en mi-bot.json`);
    const ind = await bc.asegurarIndice(m.agente_id);
    let det = 'el agente no tiene archivos';
    if (ind.archivos && ind.sinIndice.length) det = `SIN indice: ${ind.sinIndice.join(', ')} (el bot no los lee)`;
    else if (ind.archivos) det = `${ind.archivos} archivo(s) con indice${ind.reparado ? ' (se habia caido y se recupero)' : ''}`;
    fila(ind.archivos > 0 && !ind.sinIndice.length, 'Base de conocimiento', det);
  }

  if (!m.flujo_id) {
    fila(false, 'Flujo', 'falta montaje.flujo_id (mibot montar)');
  } else {
    const f = await bc.flujo(m.flujo_id);
    const pub = (f.blocks || []).map((b) => b.key).sort().join(',');
    const bor = ((f.drafts || {}).blocks || []).map((b) => b.key).sort().join(',');
    let det = 'lo publicado es igual al borrador';
    if (!pub) det = 'NO esta publicado: abrirlo en el editor, hacer clic en un paso y pulsar Guardar';
    else if (pub !== bor) det = 'lo publicado es DISTINTO del borrador: en el editor, pulsar Actualizar';
    fila(Boolean(pub) && pub === bor, 'Flujo publicado', det);
    if (conEntrada) {
      const r = await bc.respuestaPredeterminada();
      const esta = JSON.stringify(r).includes(String(m.flujo_id));
      fila(esta, 'Respuesta predeterminada', esta ? 'apunta al flujo del bot' : 'NO apunta al flujo del bot');
    }
  }

  for (const f of filas) console.log(`${f.ok ? 'OK ' : 'MAL'} ${f.que}: ${f.detalle}`);
  console.log('\nNo se leen por comando y se miran en pantalla: el modo Detalle, el historial de chat,');
  console.log('la audiencia y el saldo de Botcake AI (06-montaje.md, paso 9).');
  return filas.every((f) => f.ok) ? 0 : 1;
}

// ---------------------------------------------------------------- confirmacion de pedidos
// Receta medida en vivo (sep-2026): plantillas por la ruta interna, pasos por API, horario y filtro
// por /schedule, flujos de respuesta publicados con el boton Guardar de la pantalla.
const CONF = 'mi-confirmacion.json';
const NOMBRE_SECUENCIA = 'Confirmación de pedidos';
const ETIQUETAS_CONF = [['Pedido nuevo', '#f5a623'], ['R1', '#3aa0ff'], ['Confirmado', '#2ecc71'],
  ['Asesor', '#e74c3c'], ['Sin respuesta', '#7f8c8d']];
const PLANTILLAS_CONF = ['confirmacion', 'recordatorio'];

function cargarConf() {
  if (!fs.existsSync(CONF)) throw new Error(`No encuentro ${CONF}. Hay que hacer antes las fases 0 a 2 del recorrido de confirmacion.`);
  return JSON.parse(fs.readFileSync(CONF, 'utf8'));
}

function tiempos(c) {
  const t = c.tiempos || {};
  const rango = t.desde != null && t.hasta != null ? [Number(t.desde), Number(t.hasta)] : null;
  return { horas: Number(t.recordatorio_horas || 2), dias: Number(t.seguimiento_dias || 1), rango };
}

// Lo que Meta rechaza o Botcake no deja guardar, revisado antes de enviar nada.
function revisarPlantilla(t, que) {
  const e = [];
  const n = (t.variables || []).length;
  if (!/^[a-z0-9_]+$/.test(t.nombre || '')) e.push(`${que}: el nombre solo admite minusculas, numeros y guion bajo`);
  const usadas = [...new Set((t.cuerpo || '').match(/\{\{\d+\}\}/g) || [])];
  if (usadas.length !== n) e.push(`${que}: el texto tiene ${usadas.length} variables y "variables" tiene ${n}`);
  for (let i = 1; i <= n; i++) if (!(t.cuerpo || '').includes(`{{${i}}}`)) e.push(`${que}: falta {{${i}}} en el texto`);
  if ((t.ejemplos || []).length !== n) e.push(`${que}: hace falta un ejemplo por variable (${n})`);
  if (/^\s*\{\{/.test(t.cuerpo || '') || /\}\}\s*$/.test(t.cuerpo || '')) e.push(`${que}: Meta rechaza un texto que empieza o termina con una variable`);
  if (medir(t.cuerpo || '') > 1024) e.push(`${que}: el texto pasa de 1024 caracteres`);
  if (t.encabezado && medir(t.encabezado) > 60) e.push(`${que}: el encabezado pasa de 60 caracteres`);
  return e;
}

// Anota en mi-confirmacion.json el estado de las dos plantillas y explica lo que falta.
// Devuelve cuantas estan listas (aprobadas como UTILITY).
function estadoPlantillas(c, hay) {
  const pl = c.plantillas || {};
  let listas = 0;
  for (const que of PLANTILLAS_CONF) {
    const t = pl[que] || {};
    const x = hay.find((y) => y.name === t.nombre);
    t.estado = x ? x.status : 'NO EXISTE';
    t.categoria = x ? x.category : '';
    console.log(`  ${t.nombre}: ${t.estado}${x ? ', ' + x.category : ''}`);
    if (!x) console.log('    Todavia no se ha enviado a Meta: mibot crear-plantillas');
    else if (x.status === 'APPROVED' && x.category === 'UTILITY') listas++;
    else if (x.status === 'APPROVED') {
      console.log('    Meta la aprobo como MARKETING: cada envio cuesta varias veces mas y Meta limita cuantos recibe cada persona.');
      console.log('    Hay que quitarle lo que suene a venta y mandarla otra vez con otro nombre (terminado en _2).');
    } else if (x.status === 'REJECTED') {
      console.log('    Meta la rechazo. Hay que corregir el texto y mandarla con otro nombre (terminado en _2).');
    } else console.log('    Meta la esta revisando. Tarda de minutos a 48 horas.');
  }
  guardarProyecto(c, CONF);
  return listas;
}

async function plantillas(bc) {
  const hay = await bc.plantillas();
  console.log(`Plantillas de WhatsApp en esta cuenta: ${hay.length}`);
  for (const x of hay) console.log(`  - ${x.name} | ${x.status} | ${x.category} | ${x.language}`);
  if (!fs.existsSync(CONF)) return 0;
  console.log('\nLas del recorrido de confirmacion:');
  return estadoPlantillas(cargarConf(), hay) === PLANTILLAS_CONF.length ? 0 : 1;
}

async function crearPlantillas(bc) {
  const c = cargarConf();
  const pl = c.plantillas || {};
  if (!pl.aprobadas_por_el_usuario) {
    console.log('>>> Los textos de las plantillas no estan aprobados por el usuario (plantillas.aprobadas_por_el_usuario).');
    return 1;
  }
  const botones = [pl.boton_confirmar, pl.boton_modificar];
  const errores = [];
  for (const que of PLANTILLAS_CONF) errores.push(...revisarPlantilla(pl[que] || {}, que));
  for (const b of botones) if (!b || medir(b) > 25) errores.push(`el boton "${b || ''}" esta vacio o pasa de 25 caracteres`);
  if ((pl.confirmacion || {}).nombre === (pl.recordatorio || {}).nombre) errores.push('las dos plantillas tienen el mismo nombre');
  if (errores.length) {
    for (const e of errores) console.log(`>>> ${e}`);
    return 1;
  }
  const hay = await bc.plantillas();
  for (const que of PLANTILLAS_CONF) {
    const t = pl[que];
    const ya = hay.find((x) => x.name === t.nombre);
    if (ya) { console.log(`- ${t.nombre}: ya existe en la cuenta (${ya.status}). No se vuelve a enviar.`); continue; }
    const r = await bc.crearPlantilla(Object.assign({}, t, { botones }));
    console.log(`- ${t.nombre}: ${r.success ? 'enviada a Meta' : 'Botcake respondio ' + JSON.stringify(r).slice(0, 200)}`);
    await dormir(3000);
  }
  // Un error no garantiza que no se creo, ni un success que se creo: se lee lo que quedo.
  console.log('\nEstado segun Meta:');
  estadoPlantillas(c, await bc.plantillas());
  return 0;
}

function tarjetaPlantilla(x, variables, botones) {
  const comps = [];
  for (const k of x.components || []) {
    if (k.type === 'HEADER') comps.push({ type: 'HEADER', format: k.format, text: k.text, params: [] });
    else if (k.type === 'BODY') {
      let txt = k.text;
      variables.forEach((v, i) => { txt = txt.split(`{{${i + 1}}}`).join(`{${v}}`); });
      comps.push({ type: 'BODY', text: txt, example: k.example,
        params: variables.map((v, i) => ({ key: `{{${i + 1}}}`, value: `{${v}}` })) });
    }
  }
  comps.push({ type: 'BUTTONS', params: [], buttons: botones });
  return { key: key(10), is_valid: false, is_whatsapp: true, plugin_id: 'whatsapp_message_template',
    config: { category: x.category, id: String(x.id), language: 'es', name: x.name, components: comps } };
}

function bloqueContenido(tarjeta, kAccion) {
  return { title: 'Contenido', coordinate: { coordinateX: 0, coordinateY: 0 }, key: key(10), message_tag: 'OTHER',
    cards: [tarjeta], next_step: true,
    gotos: kAccion ? { block_key: kAccion, block_type: 'action', type: 'blocks' } : {} };
}

function bloqueAccion(k, acciones, titulo) {
  return { key: k, type: 'action', collapsed: false, coordinate: { coordinateX: 1000, coordinateY: 500 },
    title: titulo, cards: [], gotos: {}, action: acciones };
}

// Texto del editor (Slate) con las variables como pastillas: {FIRST_NAME} del POS o {{user_full_name}}.
function slateConVariables(texto) {
  return texto.split('\n').map((l) => {
    const hijos = [];
    const re = /\{\{[a-z_]+\}\}|\{[A-Z_]+\}/g;
    let m, ult = 0;
    while ((m = re.exec(l))) {
      hijos.push({ text: l.slice(ult, m.index) });
      hijos.push({ type: 'mention', character: m[0], defaultValue: '', children: [{ text: '' }] });
      ult = m.index + m[0].length;
    }
    hijos.push({ text: l.slice(ult) });
    return { type: 'paragraph', children: hijos };
  });
}

// Flujo de respuesta a un boton: mensaje y, enlazado a el, el bloque de acciones.
function bloquesRespuesta(texto, acciones) {
  const kA = key(10);
  return [
    { key: key(10), type: null, collapsed: false, coordinate: { coordinateX: 751, coordinateY: 233 }, title: 'Mensaje',
      cards: [{ id: 0, key: key(10), is_valid: false, plugin_id: 'text',
        config: { text: texto, buttons: [], rawText: slateConVariables(texto) } }],
      next_step: true, gotos: { block_key: kA, block_type: 'action', type: 'blocks' } },
    bloqueAccion(kA, acciones, 'Acciones'),
  ];
}

function cuandoDias(dias) {
  return dias === 1 ? 'Al dia siguiente' : `A los ${dias} dias`;
}

function planConfirmacion(c) {
  const pl = c.plantillas || {};
  const ms = c.mensajes || {};
  const { horas, dias, rango } = tiempos(c);
  console.log('Esto es lo que se monta (sin tocar Botcake todavia):\n');
  console.log(`Etiquetas: ${ETIQUETAS_CONF.map((e) => e[0]).join(', ')}`);
  console.log(`\nSecuencia «${NOMBRE_SECUENCIA}», con sus 3 pasos APAGADOS:`);
  console.log(`  1. En cuanto entra el pedido: plantilla ${(pl.confirmacion || {}).nombre}, con los botones «${pl.boton_confirmar}» y «${pl.boton_modificar}». Pone Pedido nuevo y R1.`);
  console.log(`  2. A las ${horas} horas${rango ? `, solo entre las ${rango[0]} y las ${rango[1]}` : ''}, y solo a quien siga con R1: plantilla ${(pl.recordatorio || {}).nombre}.`);
  console.log(`  3. ${cuandoDias(dias)}: pone «Sin respuesta» a quien nunca contesto.`);
  console.log('\nFlujos de respuesta:');
  console.log(`  «${pl.boton_confirmar}» -> "${ms.gracias || ''}"`);
  console.log('     quita Pedido nuevo y R1, pone Confirmado y lo saca de la secuencia.');
  console.log(`  «${pl.boton_modificar}» -> "${ms.modificar || ''}"`);
  console.log('     quita Pedido nuevo y R1, pone Asesor y lo saca de la secuencia.');
}

async function confirmacion(argv) {
  const c = cargarConf();
  const pl = c.plantillas || {};
  const ms = c.mensajes || {};
  if (!ms.gracias || !ms.modificar) throw new Error(`Faltan los textos de "mensajes" (gracias y modificar) en ${CONF}.`);
  if (argv.includes('--solo-ver')) { planConfirmacion(c); return 0; }

  const bc = new Botcake();
  const { horas, dias, rango } = tiempos(c);

  // Puerta: sin las dos plantillas aprobadas como UTILITY no se monta nada.
  const hay = await bc.plantillas();
  console.log('Plantillas:');
  if (estadoPlantillas(c, hay) !== PLANTILLAS_CONF.length) {
    console.log('\n>>> No se monta nada hasta que las dos esten aprobadas como UTILITY.');
    return 1;
  }
  const tpl = {};
  for (const que of PLANTILLAS_CONF) {
    const x = hay.find((y) => y.name === pl[que].nombre);
    const textos = (((x.components || []).find((k) => k.type === 'BUTTONS') || {}).buttons || []).map((b) => b.text);
    if (!textos.includes(pl.boton_confirmar) || !textos.includes(pl.boton_modificar)) {
      console.log(`>>> Los botones de ${x.name} en Meta (${textos.join(', ')}) no coinciden con los de ${CONF}.`);
      return 1;
    }
    const cuerpo = ((x.components || []).find((k) => k.type === 'BODY') || {}).text || '';
    const n = new Set(cuerpo.match(/\{\{\d+\}\}/g) || []).size;
    if (n !== pl[que].variables.length) {
      console.log(`>>> ${x.name} tiene ${n} variables en Meta y ${pl[que].variables.length} en ${CONF}.`);
      return 1;
    }
    tpl[que] = x;
  }

  const m = c.montaje || (c.montaje = {});
  m.flujos = m.flujos || {};
  m.pasos = m.pasos || {};
  const guardar = () => guardarProyecto(c, CONF);

  const { ids: tags, reutilizadas } = await bc.asegurarEtiquetas(ETIQUETAS_CONF);
  m.etiquetas = tags;
  guardar();
  if (reutilizadas.length) console.log(`\nEtiquetas que ya existian y se reutilizan: ${reutilizadas.join(', ')}`);
  if (reutilizadas.includes('Asesor')) {
    console.log('  «Asesor» es la misma del bot que conversa: quien toque «Modificar datos» queda marcado para una persona.');
  }

  if (!m.secuencia_id) { m.secuencia_id = await bc.crearSecuencia(NOMBRE_SECUENCIA); guardar(); }
  const seq = m.secuencia_id;
  // Los ids van como texto en las acciones, igual que en las cuentas donde ya funciona.
  const T = (n) => String(tags[n]);
  const salida = [{ action: 'remove_tag', action_id: [T('Pedido nuevo'), T('R1')] },
    { action: 'cancel_sign_follow_sequence', action_id: String(seq) }];

  // Los flujos se escriben solo al crearlos: reescribir uno ya publicado lo deja distinto del borrador.
  const flujos = [['gracias', 'Gracias por confirmar', ms.gracias, 'Confirmado'],
    ['modificar', 'Modificar datos del pedido', ms.modificar, 'Asesor']];
  for (const [que, nombre, txt, etiqueta] of flujos) {
    if (m.flujos[que]) continue;
    const id = await bc.crearFlujo(nombre);
    m.flujos[que] = id;
    guardar();
    await bc.guardarFlujo(id, nombre, bloquesRespuesta(txt, [{ action: 'add_tag', action_id: [T(etiqueta)] }, ...salida]));
  }

  const botones = (x) => (((x.components || []).find((k) => k.type === 'BUTTONS') || {}).buttons || []).map((b) => {
    const [id, nombre] = b.text === pl.boton_confirmar ? [m.flujos.gracias, 'Gracias por confirmar'] : [m.flujos.modificar, 'Modificar datos del pedido'];
    return { type: 'flow', text: b.text, title: b.text, key: key(10), flow_id: id, flow_name: nombre, add_actions: [] };
  });

  // Cada paso se guarda una sola vez: repetir el contenido crea flujos de respaldo sueltos.
  const pasoMensaje = async (que, nombre, bloques, horario) => {
    const p = m.pasos[que] || (m.pasos[que] = {});
    if (p.listo) return;
    if (!p.id) { p.id = await bc.crearPaso(seq, false); guardar(); }
    const a = await bc.guardarPaso(seq, p.id, nombre, bloques);
    const b = await bc.programarPaso(seq, p.id, horario);
    p.listo = Boolean(a.success !== false && b.success !== false);
    guardar();
  };
  const kA = key(10);
  await pasoMensaje('confirmacion', 'Confirmación', [
    bloqueContenido(tarjetaPlantilla(tpl.confirmacion, pl.confirmacion.variables, botones(tpl.confirmacion)), kA),
    bloqueAccion(kA, [{ action: 'add_tag', action_id: [T('Pedido nuevo'), T('R1')] }], 'Pedido nuevo y R1'),
  ], { despues: 1, unidad: 'immediately' });
  await pasoMensaje('recordatorio', 'Recordatorio', [
    bloqueContenido(tarjetaPlantilla(tpl.recordatorio, pl.recordatorio.variables, botones(tpl.recordatorio)), null),
  ], { despues: horas, unidad: 'hours', rango,
    filtro: [{ filter_type: 'equal', tags: [{ label: 'R1', page_id: null, tag_id: Number(tags.R1) }], title: 'Tag', type: 'tags' }] });

  // Paso de Accion: se crea y se programa, sin pasar por /create (le daria un flujo de respaldo y
  // Botcake ya no dejaria encenderlo).
  const sr = m.pasos.sin_respuesta || (m.pasos.sin_respuesta = {});
  if (!sr.listo) {
    if (!sr.id) { sr.id = await bc.crearPaso(seq, true); guardar(); }
    const r = await bc.programarPaso(seq, sr.id, { despues: dias, unidad: 'days', esAccion: true,
      acciones: [{ action: 'add_tag', action_id: [T('Sin respuesta')] }] });
    sr.listo = r.success !== false;
    guardar();
  }

  c.fase_actual = Math.max(c.fase_actual || 0, 4);
  guardar();
  console.log(`\nSecuencia «${NOMBRE_SECUENCIA}» (numero ${seq}). Comprobando lo que quedo:\n`);
  const ok = await verificarConfirmacion(bc, []);
  console.log('\nSiguiente: publicar los flujos que salen como NO publicados (boton Guardar de cada uno)');
  console.log('y repetir: mibot verificar-confirmacion');
  return ok;
}

// Relee la secuencia y los flujos y compara con lo que tiene que haber. Con --encendido exige
// ademas los tres pasos encendidos.
async function verificarConfirmacion(bc, argv) {
  const conEncendido = argv.includes('--encendido');
  const c = cargarConf();
  const m = c.montaje || {};
  const pl = c.plantillas || {};
  const tags = m.etiquetas || {};
  const { horas, dias } = tiempos(c);
  const filas = [];
  const fila = (ok, que, detalle) => filas.push({ ok, que, detalle });
  const pagina = bc.pageId;

  const s = m.secuencia_id ? await bc.secuencia(m.secuencia_id) : null;
  if (!s) {
    console.log(`MAL Secuencia: ${m.secuencia_id ? 'no encontre la secuencia ' + m.secuencia_id : 'falta; corre mibot confirmacion'}`);
    return 1;
  }
  const pasos = s.sequence_steps || [];
  const paso = (que) => pasos.find((p) => String(p.id) === String(((m.pasos || {})[que] || {}).id));
  const tieneTag = (lista, id) => (lista || []).map(String).includes(String(id));
  const flujosEsperados = [m.flujos && m.flujos.gracias, m.flujos && m.flujos.modificar].map(String).sort().join(',');

  for (const que of PLANTILLAS_CONF) {
    const titulo = que === 'confirmacion' ? 'Paso 1, confirmacion' : 'Paso 2, recordatorio';
    const p = paso(que);
    if (!p) { fila(false, titulo, 'no existe en la secuencia'); continue; }
    const mal = [];
    let tarjeta = null, bloque = null;
    for (const b of p.blocks || []) for (const k of b.cards || []) if (k.plugin_id === 'whatsapp_message_template') { tarjeta = k; bloque = b; }
    if (!tarjeta) mal.push('no tiene plantilla');
    else {
      const cfg = tarjeta.config || {};
      if (cfg.name !== pl[que].nombre) mal.push(`lleva la plantilla ${cfg.name}`);
      const cuerpo = (cfg.components || []).find((k) => k.type === 'BODY') || {};
      if ((cuerpo.params || []).length !== pl[que].variables.length) mal.push('variables sin enlazar al pedido');
      const bts = ((cfg.components || []).find((k) => k.type === 'BUTTONS') || {}).buttons || [];
      if (bts.map((b) => String(b.flow_id)).sort().join(',') !== flujosEsperados) mal.push('los botones no llevan a los flujos de respuesta');
    }
    const h = p.schedule || {};
    const filtro = (p.config || {}).audience_filter || [];
    const conR1 = filtro.some((f) => f.filter_type === 'equal' && (f.tags || []).some((t) => String(t.tag_id) === String(tags.R1)));
    if (que === 'confirmacion') {
      if (h.after_type !== 'immediately') mal.push(`sale a las ${h.after} ${h.after_type}, no de inmediato`);
      if (filtro.length) mal.push('tiene un filtro de audiencia que no deberia');
      const acc = (p.blocks || []).find((b) => b.type === 'action');
      const pone = acc ? (acc.action || []).filter((a) => a.action === 'add_tag').flatMap((a) => a.action_id) : [];
      const enlazada = acc && bloque && (bloque.gotos || {}).block_key === acc.key;
      if (!enlazada || !tieneTag(pone, tags['Pedido nuevo']) || !tieneTag(pone, tags.R1)) mal.push('no pone Pedido nuevo y R1');
    } else {
      if (h.after_type !== 'hours' || Number(h.after) !== horas) mal.push(`sale a las ${h.after} ${h.after_type}, no a las ${horas} hours`);
      if (!conR1) mal.push('le falta el filtro «Etiqueta igual R1»: el recordatorio le llegaria a quien ya confirmo');
    }
    fila(!mal.length, titulo, mal.length ? mal.join('; ') : `plantilla ${pl[que].nombre}, botones y horario bien`);
  }

  const sr = paso('sin_respuesta');
  if (!sr) fila(false, 'Paso 3, sin respuesta', 'no existe en la secuencia');
  else {
    const mal = [];
    const cfg = sr.config || {};
    const pone = (cfg.add_actions || []).filter((a) => a.action === 'add_tag').flatMap((a) => a.action_id);
    if (!cfg.is_action) mal.push('no es un paso de Accion (asi Botcake no ejecuta la etiqueta)');
    if (!tieneTag(pone, tags['Sin respuesta'])) mal.push('no pone «Sin respuesta»');
    if ((sr.schedule || {}).after_type !== 'days' || Number((sr.schedule || {}).after) !== dias) mal.push(`no sale ${cuandoDias(dias).toLowerCase()}`);
    if (sr.flow_id) mal.push('tiene flujo de respaldo: Botcake no va a dejar encenderlo, hay que crear otro');
    fila(!mal.length, 'Paso 3, sin respuesta', mal.length ? mal.join('; ') : `pone «Sin respuesta» ${cuandoDias(dias).toLowerCase()}`);
  }

  for (const [que, etiqueta] of [['gracias', 'Confirmado'], ['modificar', 'Asesor']]) {
    const titulo = que === 'gracias' ? 'Flujo Gracias por confirmar' : 'Flujo Modificar datos';
    const id = (m.flujos || {})[que];
    if (!id) { fila(false, titulo, 'no existe'); continue; }
    const f = await bc.flujo(id);
    const pub = (f.blocks || []).map((b) => b.key).sort().join(',');
    const bor = ((f.drafts || {}).blocks || []).map((b) => b.key).sort().join(',');
    const acc = (f.blocks && f.blocks.length ? f.blocks : (f.drafts || {}).blocks || []).find((b) => b.type === 'action') || {};
    const a = acc.action || [];
    const mal = [];
    if (!pub) mal.push(`NO esta publicado: abrir botcake.io/${pagina}/flows/${id}/content y pulsar Guardar`);
    else if (pub !== bor) mal.push(`lo publicado es distinto del borrador: abrir botcake.io/${pagina}/flows/${id}/content y pulsar Actualizar`);
    if (!a.some((x) => x.action === 'add_tag' && tieneTag(x.action_id, tags[etiqueta]))) mal.push(`no pone ${etiqueta}`);
    if (!a.some((x) => x.action === 'remove_tag' && tieneTag(x.action_id, tags.R1))) mal.push('no quita R1');
    if (!a.some((x) => x.action === 'cancel_sign_follow_sequence' && String(x.action_id) === String(m.secuencia_id))) mal.push('no saca a la persona de la secuencia');
    fila(!mal.length, titulo, mal.length ? mal.join('; ') : `publicado; pone ${etiqueta}, quita Pedido nuevo y R1 y lo saca de la secuencia`);
  }

  const nuestros = ['confirmacion', 'recordatorio', 'sin_respuesta'].map(paso).filter(Boolean);
  const encendidos = nuestros.filter((p) => p.is_published).length;
  if (conEncendido) fila(encendidos === 3, 'Pasos encendidos', `${encendidos} de 3`);
  else fila(true, 'Pasos encendidos', `${encendidos} de 3${encendidos ? '' : ' (apagados, como deben estar hasta que se autorice)'}`);

  for (const f of filas) console.log(`${f.ok ? 'OK ' : 'MAL'} ${f.que}: ${f.detalle}`);
  const respaldo = nuestros.filter((p) => p.flow_id).map((p) => p.flow_id);
  if (respaldo.length) {
    console.log(`\nFlujos de respaldo de los pasos (${respaldo.join(', ')}): no hacen falta para enviar; se publican`);
    console.log('igual con Guardar para que la lista de flujos no quede con borradores a medias.');
  }
  return filas.every((f) => f.ok) ? 0 : 1;
}

async function interruptorConfirmacion(bc, encender) {
  const c = cargarConf();
  const m = c.montaje || {};
  const nombres = ['Paso 1, confirmacion', 'Paso 2, recordatorio', 'Paso 3, sin respuesta'];
  const ids = ['confirmacion', 'recordatorio', 'sin_respuesta'].map((k) => ((m.pasos || {})[k] || {}).id);
  if (!m.secuencia_id || ids.some((x) => !x)) {
    console.log('>>> Faltan pasos por montar. Corre antes: mibot confirmacion');
    return 1;
  }
  for (const id of ids) { await bc.encenderPaso(m.secuencia_id, id, encender); await dormir(1000); }
  const s = await bc.secuencia(m.secuencia_id);
  const pasos = (s && s.sequence_steps) || [];
  let bien = 0;
  ids.forEach((id, i) => {
    const p = pasos.find((x) => String(x.id) === String(id));
    const esta = Boolean(p && p.is_published);
    if (esta === encender) bien++;
    console.log(`  ${nombres[i]}: ${esta ? 'ENCENDIDO' : 'apagado'}`);
  });
  c.encendido = Object.assign(c.encendido || {}, { pasos_activos: encender && bien === ids.length });
  guardarProyecto(c, CONF);
  if (bien === ids.length) return 0;
  console.log(`\n>>> No quedaron todos ${encender ? 'encendidos' : 'apagados'}. Hazlo en pantalla: botcake.io/${bc.pageId}/sequence,`);
  console.log(`    secuencia «${NOMBRE_SECUENCIA}», interruptor «Activar» de cada paso.`);
  return 1;
}

// ---------------------------------------------------------------- main
async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) return uso();
  const cmd = argv[0];
  const args = sinOpciones(argv.slice(1));

  if (cmd === 'sesion') return sesion(args);
  if (cmd === 'paginas') return paginas();
  if (cmd === 'pagina') return pagina(args);
  if (cmd === 'medir') return args[0] ? medirArchivo(args[0]) : uso();
  if (cmd === 'montar') return montar(argv.slice(1));
  if (cmd === 'confirmacion') return confirmacion(argv.slice(1));

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
    case 'quitar-kb': return quitarKb(bc, args[0], args[1]);
    case 'verificar': return verificar(bc, argv.slice(1));
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
    case 'plantillas': return plantillas(bc);
    case 'crear-plantillas': return crearPlantillas(bc);
    case 'verificar-confirmacion': return verificarConfirmacion(bc, argv.slice(1));
    case 'encender-confirmacion': return interruptorConfirmacion(bc, true);
    case 'apagar-confirmacion': return interruptorConfirmacion(bc, false);
    default: return uso();
  }
}

main().then((c) => process.exit(c || 0)).catch((e) => {
  console.log(`>>> ${e.message}`);
  process.exit(1);
});
