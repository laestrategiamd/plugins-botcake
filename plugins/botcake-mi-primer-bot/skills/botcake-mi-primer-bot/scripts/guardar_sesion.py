"""Guarda la llave de sesion y la pagina.  Uso: python3 guardar_sesion.py <llave> <page_id>"""
import json, os, stat, sys

SESION = ".botcake-sesion"


def main():
    if len(sys.argv) != 3:
        print("Uso: python3 guardar_sesion.py <llave> <page_id>")
        return 1
    llave, page_id = sys.argv[1].strip(), sys.argv[2].strip()
    if not llave.startswith("eyJ"):
        print("Esa llave no tiene la forma correcta (deberia empezar por 'eyJ').")
        print("Se copio mal, o se copio la clave equivocada. Repetir el paso 3 de la Fase 6.")
        return 1
    with open(SESION, "w", encoding="utf-8") as f:
        json.dump({"token": llave, "page_id": page_id}, f)
    os.chmod(SESION, stat.S_IRUSR | stat.S_IWUSR)

    lineas = []
    if os.path.exists(".gitignore"):
        with open(".gitignore", encoding="utf-8") as f:
            lineas = f.read().splitlines()
    for entrada in (SESION, "mi-bot.json"):
        if entrada not in lineas:
            lineas.append(entrada)
    with open(".gitignore", "w", encoding="utf-8") as f:
        f.write("\n".join(lineas) + "\n")

    print("Sesion guardada en %s (solo la puede leer tu usuario)." % SESION)
    print("Pagina: %s" % page_id)
    return 0


if __name__ == "__main__":
    sys.exit(main())
