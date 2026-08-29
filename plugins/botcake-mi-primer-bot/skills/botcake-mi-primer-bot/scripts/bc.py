"""Comandos sueltos sobre la cuenta de Botcake del usuario.

  python3 bc.py probar
  python3 bc.py estado
  python3 bc.py crear-etiqueta "Asesor" "#e74c3c"
  python3 bc.py crear-campo "Nombre"
  python3 bc.py ver-agente <id>
  python3 bc.py ver-conocimiento <id> "frase que tiene que estar"
"""
import json, sys, urllib.request
from _cliente import Botcake


def probar(bc):
    ts = bc.etiquetas()
    if not isinstance(ts, list):
        print("No pude leer la cuenta. Revisa 08-cuando-falla.md")
        return 1
    print("Conexion correcta con la pagina %s." % bc.page_id)
    print("Etiquetas que ya existen: %d" % len(ts))
    return 0


def estado(bc):
    print("PAGINA: %s" % bc.page_id)
    print("\nETIQUETAS")
    for t in bc.etiquetas():
        print("  - %s (id %s)" % (t.get("name"), t.get("id")))
    print("\nCAMPOS")
    for c in bc.campos():
        print("  - %s (id %s)" % (c.get("name"), c.get("id")))
    print("\nAGENTES")
    for a in bc.agentes():
        print("  - %s (id %s)" % (a.get("name"), a.get("id")))
    return 0


def ver_agente(bc, agente_id):
    a = bc.agente(agente_id)
    if not a:
        print("No encontre ese agente. Comprueba el numero en la direccion de la pantalla.")
        return 1
    p = (a.get("instructions") or {}).get("general_prompt") or ""
    print("Agente: %s" % a.get("name"))
    print("Modelo: %s" % a.get("model"))
    print("Caracteres del prompt: %d" % len(p))
    print("Archivos de conocimiento enganchados: %d" % len(a.get("files_library") or []))
    print("\nPrimeras lineas del prompt que tiene ahora:")
    for linea in p.splitlines()[:6]:
        print("  | %s" % linea)
    if not p.strip():
        print("\n>>> EL PROMPT ESTA VACIO. No se guardo. Repetir el paso 8.")
        return 1
    return 0


def ver_conocimiento(bc, agente_id, frase):
    a = bc.agente(agente_id)
    archivos = a.get("files_library") or []
    if not archivos:
        print(">>> El agente NO tiene ningun archivo de conocimiento. Repetir el paso 9.")
        return 1
    ok = False
    for f in archivos:
        try:
            txt = urllib.request.urlopen(f.get("path"), timeout=40).read().decode("utf-8", "ignore")
        except Exception as e:
            print("  - %s: no pude descargarlo (%s)" % (f.get("name"), e))
            continue
        tiene = frase.lower() in txt.lower()
        print("  - %s: %d caracteres | contiene la frase: %s" % (
            f.get("name"), len(txt), "SI" if tiene else "NO"))
        ok = ok or tiene
    if not ok:
        print("\n>>> El archivo que el agente tiene ahora NO contiene esa frase.")
        print("    Se subio pero no se guardo, o quedo marcado el archivo viejo. Repetir el paso 9.")
        return 1
    print("\nEl archivo entro de verdad.")
    return 0


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    cmd = sys.argv[1]
    bc = Botcake()
    if cmd == "probar":
        return probar(bc)
    if cmd == "estado":
        return estado(bc)
    if cmd == "crear-etiqueta":
        color = sys.argv[3] if len(sys.argv) > 3 else "#7B2D8E"
        t = bc.crear_etiqueta(sys.argv[2], color)
        print(json.dumps(t, ensure_ascii=False) if t else "No se pudo crear.")
        return 0 if t else 1
    if cmd == "crear-campo":
        bc.crear_campo(sys.argv[2])
        ids = {c.get("name"): c.get("id") for c in bc.campos()}
        print("Campo '%s' -> id %s" % (sys.argv[2], ids.get(sys.argv[2])))
        return 0 if ids.get(sys.argv[2]) else 1
    if cmd == "ver-agente":
        return ver_agente(bc, sys.argv[2])
    if cmd == "ver-conocimiento":
        return ver_conocimiento(bc, sys.argv[2], sys.argv[3])
    print(__doc__)
    return 1


if __name__ == "__main__":
    sys.exit(main())
