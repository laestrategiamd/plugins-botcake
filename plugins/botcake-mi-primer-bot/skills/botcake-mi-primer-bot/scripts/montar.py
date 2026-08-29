"""Monta el flujo del bot a partir de mi-bot.json.  Uso: python3 montar.py [--solo-ver]"""
import json, os, sys
from _cliente import Botcake, key

PROY = "mi-bot.json"


def cargar():
    if not os.path.exists(PROY):
        raise SystemExit("No encuentro %s. Hay que hacer antes las fases 1 a 5." % PROY)
    with open(PROY, encoding="utf-8") as f:
        return json.load(f)


def guardar(p):
    p_tmp = PROY + ".tmp"
    with open(p_tmp, "w", encoding="utf-8") as f:
        json.dump(p, f, ensure_ascii=False, indent=2)
    os.replace(p_tmp, PROY)


def texto(k, t):
    return {"key": k, "plugin_id": "text",
            "config": {"text": t,
                       "rawText": [{"type": "paragraph", "children": [{"text": t}]}],
                       "buttons": []}}


def construir(agente_id, campo_preg, campo_resp, tag_bot, tag_asesor, ramas):
    k_ini, k_guarda, k_stop, k_ai, k_router, k_bucle = (key() for _ in range(6))
    bloques = []
    x, y = 100, 100

    bloques.append({"key": k_ini, "type": "action", "title": "Inicio", "collapsed": False,
                    "cards": [], "action": [{"action": "add_tag", "action_id": [tag_bot]}],
                    "coordinate": {"coordinateX": x, "coordinateY": y},
                    "gotos": {"block_key": k_guarda, "block_type": "condition", "type": "blocks"}})

    bloques.append({"key": k_guarda, "type": "condition", "title": "Ya lo atiende una persona?",
                    "collapsed": False,
                    "cards": [{"key": key(), "type": "and", "config": {},
                               "condition": [{"filter_type": "equal", "title": "Tag", "type": "tags",
                                              "tags": [{"label": "Asesor", "page_id": None,
                                                        "tag_id": tag_asesor}]}],
                               "gotos": {"block_key": k_stop, "block_type": "action", "type": "blocks"}}],
                    "coordinate": {"coordinateX": x + 320, "coordinateY": y},
                    "defaultGotos": {"block_key": k_ai, "type": "blocks"}})

    bloques.append({"key": k_stop, "type": "action", "title": "No contestar", "collapsed": False,
                    "cards": [], "action": [{"action": "deactivate_gpt"}],
                    "coordinate": {"coordinateX": x + 320, "coordinateY": y + 260}, "gotos": {}})

    bloques.append({"key": k_ai, "type": "AI", "title": "El agente contesta", "next_step": True,
                    "collapsed": False,
                    "cards": [{"id": 0, "key": key(), "type": "default", "config": {},
                               "gotos": {"block_key": k_router, "block_type": "condition",
                                         "type": "blocks"}}],
                    "config": {"selected_agent": agente_id,
                               "customer_question": "{{%s//Pregunta Cliente}} y/o {{last_text_input}}" % campo_preg,
                               "save_res_to_field_id": campo_resp,
                               "list_products": [], "list_products_enabled": False,
                               "additional_instructions": "", "additional_instructions_enabled": False,
                               "typing_indicator": False},
                    "coordinate": {"coordinateX": x + 640, "coordinateY": y},
                    "defaultGotos": {"block_key": k_bucle, "type": "blocks"}})

    cards, extra = [], []
    for i, r in enumerate(ramas):
        k_acc = key()
        frase = r["frase"]
        destino, tipo = k_acc, "action"
        if r.get("mensaje"):
            k_msg = key()
            extra.append({"key": k_msg, "type": None, "title": "Mensaje %s" % r["etiqueta"],
                          "next_step": True, "collapsed": False,
                          "cards": [texto(key(), r["mensaje"])],
                          "coordinate": {"coordinateX": x + 960, "coordinateY": y + 200 * i},
                          "gotos": {"block_key": k_acc, "block_type": "action", "type": "blocks"}})
            destino, tipo = k_msg, None
        cards.append({"key": key(), "type": "and", "config": {},
                      "condition": [
                          {"cuf_id": campo_resp, "cuf_type": 1, "filter_type": "contains",
                           "label": "Respuesta IA", "title": "Respuesta IA", "type": "cuf",
                           "value": None, "values": [frase, frase.capitalize(), frase.lower()]},
                          {"filter_type": "not_equal", "title": "Tag", "type": "tags",
                           "tags": [{"label": r["etiqueta"], "page_id": None, "tag_id": r["tag_id"]}]}],
                      "gotos": {"block_key": destino, "block_type": tipo, "type": "blocks"}})
        acciones = [{"action": "add_tag", "action_id": [r["tag_id"]]}]
        if r.get("apaga_agente"):
            acciones.append({"action": "deactivate_gpt"})
        extra.append({"key": k_acc, "type": "action", "title": r["etiqueta"], "collapsed": False,
                      "cards": [], "action": acciones,
                      "coordinate": {"coordinateX": x + 1280, "coordinateY": y + 200 * i},
                      "gotos": {} if r.get("apaga_agente") else
                               {"block_key": k_bucle, "block_type": None, "type": "blocks"}})

    bloques.append({"key": k_router, "type": "condition", "title": "Revisor", "collapsed": False,
                    "cards": cards,
                    "coordinate": {"coordinateX": x + 960, "coordinateY": y - 200},
                    "defaultGotos": {"block_key": k_bucle, "type": "blocks"}})
    bloques.extend(extra)

    bloques.append({"key": k_bucle, "type": None, "title": "Bucle", "next_step": True,
                    "collapsed": False,
                    "cards": [{"id": 0, "key": key(), "is_valid": False, "plugin_id": "user_input",
                               "config": {"customFieldType": 1, "custom_field_id": campo_preg,
                                          "preferred_language": "es", "reply_type": "text",
                                          "retry_message": "", "run_keyword_if_void": True,
                                          "skip_btn": "", "text": ""},
                               "add_actions": [], "quick_reply_user_input": [{"title": ""}]}],
                    "coordinate": {"coordinateX": x + 640, "coordinateY": y + 400},
                    "gotos": {"block_key": k_ai, "block_type": "AI", "type": "blocks"}})
    return bloques


def main():
    p = cargar()
    m = p.setdefault("montaje", {})
    agente_id = m.get("agente_id")
    if not agente_id:
        raise SystemExit("Falta el numero del agente en mi-bot.json (paso 7 de la Fase 7).")
    ramas = (p.get("flujo") or {}).get("ramas") or []
    if not ramas:
        raise SystemExit("No hay ramas definidas en mi-bot.json (seccion 'flujo').")

    bc = Botcake()
    campos = bc.asegurar_campos(["Pregunta Cliente", "Respuesta IA"])
    specs = [("Bot", "#95a5a6"), ("Asesor", "#e74c3c")]
    for r in ramas:
        specs.append((r["etiqueta"], r.get("color", "#7B2D8E")))
    tags = bc.asegurar_etiquetas(specs)
    for r in ramas:
        r["tag_id"] = tags[r["etiqueta"]]

    nombre = (p.get("flujo") or {}).get("nombre") or ("Bot %s" % (p.get("negocio", {}).get("nombre") or ""))
    flujo_id = m.get("flujo_id") or bc.crear_flujo(nombre)
    bloques = construir(agente_id, campos["Pregunta Cliente"], campos["Respuesta IA"],
                        tags["Bot"], tags["Asesor"], ramas)
    bc.guardar_flujo(flujo_id, nombre, bloques)

    leido = bc.flujo(flujo_id)
    puestos = ((leido.get("drafts") or {}).get("blocks")) or []
    m.update({"flujo_id": flujo_id, "etiquetas": tags, "campos": campos,
              "punto_de_entrada": False, "encendido": False})
    p["montaje"] = m
    guardar(p)

    print("Flujo '%s' (numero %s)" % (nombre, flujo_id))
    print("Pasos que quedaron montados: %d" % len(puestos))
    for b in puestos:
        print("  - %s" % (b.get("title") or b.get("key")))
    print("\nRamas del revisor:")
    for r in ramas:
        print("  - cuando el agente escriba '%s' -> etiqueta '%s'%s" % (
            r["frase"], r["etiqueta"], " y se apaga" if r.get("apaga_agente") else ""))
    if len(puestos) != len(bloques):
        print("\n>>> OJO: se enviaron %d pasos y quedaron %d. Revisar 08-cuando-falla.md"
              % (len(bloques), len(puestos)))
        return 1
    print("\nEl bot esta montado y APAGADO: todavia no tiene punto de entrada.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
