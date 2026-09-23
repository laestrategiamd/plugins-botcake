# Fase 3: el montaje

Casi todo lo hace `mibot`, desde la carpeta del proyecto. El navegador del plugin solo hace
falta para publicar dos flujos con el boton Guardar. Al final todo queda **apagado**.

> 🔴 **Despues de cada paso, compruebas.** Botcake responde "listo" en varios sitios donde
> no guardo nada. `mibot` relee cada cosa y `mibot verificar-confirmacion` lo revisa todo
> junto. Nunca digas "quedo" sin haberlo leido de vuelta.

---

## Paso 1. La llave y las plantillas

```bash
mibot probar
mibot plantillas
```

Si `probar` falla con `Invalid access_token`, la llave caduco: se repiten los pasos 2 y 3
de la Fase 6 de `../botcake-mi-primer-bot/references/06-montaje.md` (la pagina elegida se
conserva).

`plantillas` tiene que decir `APPROVED, UTILITY` en las dos del recorrido. Si una sigue en
`PENDING`, se lo dices al usuario y cierras: *"Meta todavia no las aprueba. Vuelve a
escribir sigamos con mi confirmacion en unas horas."* Si una salio rechazada o en
Marketing, vuelves a la Fase 2 (`01-textos.md`, ultima seccion).

## Paso 2. Ensenarle lo que se va a montar

```bash
mibot confirmacion --solo-ver
```

No toca Botcake. Imprime las etiquetas, los tres pasos con sus tiempos y lo que hace cada
boton. Ensenaselo tal cual y explicale en una frase que es cada cosa:

- **Etiqueta:** una marca que queda pegada al contacto en la bandeja de Pancake. Sirve para
  filtrar ("todos los Confirmado").
- **Secuencia:** los mensajes que salen solos, cada uno a su hora, contados desde que entra
  el pedido.
- **R1:** la marca de "todavia no ha respondido". Se pone con el primer mensaje y se quita
  cuando toca cualquiera de los dos botones. El recordatorio solo le llega a quien la
  conserva.

La estructura es fija; lo que el usuario decide (textos y tiempos) ya lo aprobo. Sigues.

## Paso 3. Respaldo

```bash
mibot respaldo
```

Baja a `respaldos/` la lista de flujos y los agentes que ya tenga la pagina. Este
recorrido no pisa nada que exista (todo lo crea nuevo y las etiquetas que ya existen se
reutilizan), pero el respaldo va siempre antes de escribir.

## Paso 4. Montar

```bash
mibot confirmacion
```

En este orden: revisa otra vez las dos plantillas en Meta, crea o reutiliza las cinco
etiquetas, crea la secuencia «Confirmación de pedidos», los dos flujos de respuesta
(«Gracias por confirmar» y «Modificar datos del pedido») y los tres pasos, y al final lo
relee todo. Cada numero que crea lo apunta en `mi-confirmacion.json` en el momento: **si se
corta a mitad, se vuelve a correr y sigue donde iba** sin duplicar nada.

Lo normal en la primera vuelta es que termine con los dos flujos sin publicar:

```
OK  Paso 1, confirmacion: plantilla confirmacion_pedido, botones y horario bien
OK  Paso 2, recordatorio: plantilla recordatorio_confirmacion, botones y horario bien
OK  Paso 3, sin respuesta: pone «Sin respuesta» a los 1 dia(s)
MAL Flujo Gracias por confirmar: NO esta publicado: abrir botcake.io/<pagina>/flows/<numero>/content y pulsar Guardar
MAL Flujo Modificar datos: NO esta publicado: abrir botcake.io/<pagina>/flows/<numero>/content y pulsar Guardar
OK  Pasos encendidos: 0 de 3 (apagados, como deben estar hasta que se autorice)
```

Si salio el aviso de etiquetas reutilizadas, explicaselo: son marcas que la pagina ya
tenia. Si «Asesor» ya existia porque hizo el bot que conversa, es la misma: quien toque
«Modificar datos» queda marcado igual que cuando el bot pasa a una persona, y el bot no le
contesta.

## Paso 5. Publicar los flujos `[lo haces tu con el navegador del plugin]`

Un flujo recien creado esta en borrador y **un boton que lleva a un borrador no hace
nada**. Se publica con el boton de la pantalla (por comando no queda publicado de verdad).

1. Abre en el navegador del plugin la direccion que dio el `MAL`
   (`https://botcake.io/<pagina>/flows/<numero>/content`). Si pide iniciar sesion, lo hace
   el usuario (como en el paso 2 de la Fase 6 del bot que conversa).
2. Busca en el encabezado el boton **Guardar** (si el flujo ya estaba publicado y cambio,
   dice **Actualizar**) y pulsalo.
3. Lo mismo con el otro flujo.
4. `mibot verificar-confirmacion` al final dice tambien los numeros de los **flujos de
   respaldo** de los pasos 1 y 2: Botcake los crea solo y nacen en borrador. No hacen falta
   para enviar, pero publicalos igual (mismo boton) para que la lista de flujos del usuario
   no quede con borradores a medias.

## Paso 6. Revisar todo

```bash
mibot verificar-confirmacion
```

Todas las lineas tienen que decir `OK`, con los pasos **apagados**. Ensenale la tabla al
usuario. Si alguna dice `MAL`:

| Lo que dice | Que se hace |
|---|---|
| `NO esta publicado` o `distinto del borrador` | Paso 5 con ese flujo |
| `no existe en la secuencia` | Correr otra vez `mibot confirmacion`: reintenta ese paso |
| `le falta el filtro «Etiqueta igual R1»` | En pantalla: `botcake.io/<pagina>/sequence` > «Confirmación de pedidos» > en el paso Recordatorio, clic en el texto del horario («Después de 2 Horas...») > **Agregar filtro** > Etiqueta, Igual, R1 > **Guardar y actualizar** |
| `tiene flujo de respaldo` (paso 3) | Ese paso ya no se va a poder encender. Borra `montaje.pasos.sin_respuesta` de `mi-confirmacion.json`, corre otra vez `mibot confirmacion` (crea uno nuevo) y borra el viejo en la pantalla de la secuencia |
| `no pone Pedido nuevo y R1` | Anotalo en `pendientes`. En la Fase 4 la regla del POS pone esas dos marcas tambien, y cubre este fallo |
| Cualquier otra | No la arregles a mano: anotala en `pendientes` y pidele al usuario que la reporte a quien le entrego el plugin |

## Paso 7. Cerrar la tanda

Si quiere verlo, abre `botcake.io/<pagina>/sequence` y ensenale la secuencia con sus tres
pasos y los interruptores «Activar» apagados. Guarda `mi-confirmacion.json`
(`fase_actual: 4`) y cierra la tanda 2.

**No enciendas nada todavia.** Encender va en la Fase 4, con el "si" del usuario.
