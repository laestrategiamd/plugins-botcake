# Plantillas por rubro

Sirven para dos cosas: acortar el cuestionario (rellenas lo tipico y el usuario solo
corrige) y no olvidar los limites propios de cada negocio.

**Nunca uses la plantilla como si fuera la verdad del negocio.** Lo que rellenes con ella
se lo ensenas al usuario y le pides que confirme o corrija, dato por dato.

---

## Tienda / ecommerce

**Lo que casi siempre hay que preguntar aparte:** tallas o medidas, colores disponibles,
si hay contra entrega, cuanto tarda el envio por ciudad.

**Lo que el bot NO debe hacer:** prometer fecha exacta de entrega, dar descuentos por su
cuenta, confirmar que hay stock si el inventario no esta conectado.

**Cuando pasa a una persona:** cambio o devolucion, pedido que no llego, reclamo.

**Datos que conviene capturar:** nombre, ciudad, producto de interes, talla o medida.

---

## Servicios (agencias, tecnicos, profesionales)

**Lo que casi siempre hay que preguntar aparte:** como cobra (por hora, por proyecto,
mensual), si da precio por chat o solo despues de diagnostico, cuanto dura el servicio.

**Lo que el bot NO debe hacer:** cotizar un proyecto. Casi ningun servicio se puede cotizar
sin entender el caso. El bot da rangos y agenda.

**Cuando pasa a una persona:** cuando el cliente ya quiere cotizacion o ya quiere agendar.

**Datos que conviene capturar:** nombre, que necesita, tamano del negocio o del proyecto,
cuando lo necesita.

---

## Salud, estetica y bienestar

⚠️ **Es el rubro de mas riesgo.** Un bot que da consejo de salud mete al negocio en un
problema serio, y las plataformas tambien lo penalizan.

**Reglas que van SIEMPRE en el prompt, sin preguntar:**
- No diagnostica, no recomienda tratamientos, no dice si algo "sirve para" una dolencia.
- No promete resultados, ni tiempos de recuperacion, ni "cura", "elimina", "sana".
- Ante cualquier sintoma o pregunta clinica: pasa a una persona. Sin excepcion.

**Lo que si hace:** informar horarios, ubicacion, precios de consulta, agendar, explicar en
que consiste un servicio en terminos generales.

**Datos que conviene capturar:** nombre, motivo de consulta en una frase, disponibilidad.

---

## Educacion (cursos, academias, formacion)

**Lo que casi siempre hay que preguntar aparte:** fechas de inicio, duracion, si hay
certificado, si es en vivo o grabado, formas de pago y cuotas.

**Lo que el bot NO debe hacer:** prometer empleo o resultados economicos ("vas a ganar X").
Ni inventar que hay certificado si no lo hay: es la objecion numero uno y hay que tener la
respuesta preparada.

**Cuando pasa a una persona:** convalidaciones, pagos con problema, becas o descuentos.

**Datos que conviene capturar:** nombre, que curso le interesa, ciudad, cuando quiere
empezar.

---

## Inmuebles y vehiculos

**Lo que casi siempre hay que preguntar aparte:** zonas donde opera, rango de precios, si
hay financiacion, requisitos para arrendar o comprar.

**Lo que el bot NO debe hacer:** confirmar disponibilidad de una unidad concreta si el
inventario no esta conectado. Es el error mas caro de este rubro: el cliente llega y la
unidad ya no esta.

**Cuando pasa a una persona:** cuando quiere ver una unidad o hablar de precio.

**Datos que conviene capturar:** nombre, zona, presupuesto, cuando necesita mudarse o
comprar.
