"""Cliente interno. No editar sin probar contra una cuenta de prueba."""
import json, os, random, string, urllib.request, urllib.error

BASE = "https://botcake.io/api/v1/pages"
SESION = ".botcake-sesion"


def key(n=8):
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=n))


def cargar_sesion():
    if not os.path.exists(SESION):
        raise SystemExit(
            "No encuentro la sesion. Hay que repetir los pasos 2 y 3 de la Fase 6:\n"
            "  el usuario inicia sesion en el navegador y se vuelve a guardar la llave."
        )
    with open(SESION, encoding="utf-8") as f:
        d = json.load(f)
    if not d.get("token") or not d.get("page_id"):
        raise SystemExit("La sesion guardada esta incompleta. Repetir los pasos 2 y 3 de la Fase 6.")
    return d


class Botcake:
    def __init__(self, page_id=None, token=None):
        s = None
        if page_id is None or token is None:
            s = cargar_sesion()
        self.page_id = page_id or s["page_id"]
        self.token = token or s["token"]

    def _url(self, path):
        sep = "&" if "?" in path else "?"
        return "%s/%s/%s%saccess_token=%s" % (BASE, self.page_id, path, sep, self.token)

    def _leer(self, req):
        try:
            return json.loads(urllib.request.urlopen(req, timeout=40).read().decode())
        except urllib.error.HTTPError as e:
            return {"success": False, "http": e.code, "error": e.read().decode()[:400]}
        except urllib.error.URLError as e:
            return {"success": False, "error": "sin conexion: %s" % e.reason}

    def get(self, path):
        return self._leer(urllib.request.Request(self._url(path), method="GET"))

    def delete(self, path):
        return self._leer(urllib.request.Request(self._url(path), method="DELETE"))

    def post(self, path, fields):
        b = "----bc" + key(10)
        cuerpo = "".join(
            '--%s\r\nContent-Disposition: form-data; name="%s"\r\n\r\n%s\r\n' % (b, n, v)
            for n, v in fields
        ) + "--%s--\r\n" % b
        req = urllib.request.Request(
            self._url(path), data=cuerpo.encode("utf-8"), method="POST",
            headers={"Content-Type": "multipart/form-data; boundary=%s" % b})
        return self._leer(req)

    def put(self, path, fields):
        b = "----bc" + key(10)
        cuerpo = "".join(
            '--%s\r\nContent-Disposition: form-data; name="%s"\r\n\r\n%s\r\n' % (b, n, v)
            for n, v in fields
        ) + "--%s--\r\n" % b
        req = urllib.request.Request(
            self._url(path), data=cuerpo.encode("utf-8"), method="PUT",
            headers={"Content-Type": "multipart/form-data; boundary=%s" % b})
        return self._leer(req)

    # etiquetas
    def etiquetas(self):
        return self.get("tags").get("tags", []) or []

    def crear_etiqueta(self, nombre, color="#7B2D8E"):
        if len(nombre) > 15:
            raise SystemExit("La etiqueta '%s' tiene %d caracteres. El maximo es 15." % (nombre, len(nombre)))
        self.post("tags", [("selectedTag[name]", nombre),
                           ("selectedTag[tag_type]", "pancake"),
                           ("selectedTag[color]", color)])
        for t in self.etiquetas():
            if t.get("name") == nombre:
                return t
        return None

    def asegurar_etiquetas(self, specs):
        hay = {t.get("name"): t for t in self.etiquetas()}
        out = {}
        for nombre, color in specs:
            t = hay.get(nombre)
            if t and t.get("pancake_tag_id") is not None:
                out[nombre] = t["id"]
            else:
                nuevo = self.crear_etiqueta(nombre, color)
                if not nuevo:
                    raise SystemExit("No se pudo crear la etiqueta '%s'." % nombre)
                out[nombre] = nuevo["id"]
        return out

    # campos
    def campos(self):
        r = self.get("custom_field")
        return r.get("custom_fields") or r.get("data") or []

    def crear_campo(self, nombre):
        return self.post("custom_field", [("changes", json.dumps(
            {"name": nombre, "type": 1, "description": "", "sync_crm": [],
             "order_field": None, "sync_crm_index": [], "folder_id": None},
            ensure_ascii=False))])

    def asegurar_campos(self, nombres):
        hay = {c.get("name"): c.get("id") for c in self.campos()}
        out = {}
        for n in nombres:
            if n in hay:
                out[n] = hay[n]
            else:
                self.crear_campo(n)
                for c in self.campos():
                    if c.get("name") == n:
                        out[n] = c.get("id")
        faltan = [n for n in nombres if not out.get(n)]
        if faltan:
            raise SystemExit("No se pudieron crear los campos: %s" % ", ".join(faltan))
        return out

    # agentes
    def agentes(self):
        r = self.get("ai/assistants")
        return r.get("assistants") or r.get("data") or []

    def agente(self, agente_id):
        return self.get("ai/%s" % agente_id).get("assistant") or {}

    # palabras clave
    def palabras(self):
        r = self.get("keywords")
        return r.get("keywords") or r.get("data") or []

    def borrar_palabra(self, keyword_id):
        return self.delete("keywords/%s" % keyword_id)

    # flujos
    def crear_flujo(self, nombre):
        r = self.post("flow/create", [("changes", json.dumps(
            {"name": nombre, "contents": [], "path": [], "blocks": []}, ensure_ascii=False))])
        f = r.get("flow") or {}
        if not f.get("id"):
            raise SystemExit("No se pudo crear el flujo: %s" % json.dumps(r)[:300])
        return f["id"]

    def guardar_flujo(self, flujo_id, nombre, bloques):
        return self.post("flow/draft", [("changes", json.dumps(
            {"id": flujo_id, "name": nombre, "is_locked": None, "config": {}, "blocks": bloques},
            ensure_ascii=False))])

    def flujo(self, flujo_id):
        return self.get("flow/%s" % flujo_id).get("flow") or {}
