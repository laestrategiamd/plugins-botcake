# Reportar un fallo

Cuando algo no sale como dice la guia, la mayoria de las veces es configuracion de la cuenta
(saldo, permisos, una pagina distinta, una plantilla sin aprobar), no un fallo del plugin.
Este protocolo separa las dos cosas **antes** de reportar. Solo se reporta lo que queda
despues de descartar la configuracion.

Lo usan los cuatro recorridos. Se activa cuando el usuario dice "reporta este fallo", o
cuando tu llegas al final de un "si algo se rompe" sin solucion.

---

## Paso 1. Repetir una vez

Repite exactamente el mismo paso una vez (el mismo comando o los mismos clics). Si la
segunda vez sale bien, no hay nada que reportar: fue algo pasajero (la red, Botcake lento).

## Paso 2. Descartar la configuracion

Corre las comprobaciones que tocan al recorrido y **anota cada una con su resultado**: el
reporte las lleva, y sin ellas el buzon lo rechaza.

| Comprobacion | Como | Que lo descarta |
|---|---|---|
| La llave de sesion | `mibot probar` | "Conexion correcta" |
| La pagina correcta | `mibot paginas` y la elegida en `.botcake-sesion` | Es la del recorrido (`waba_` para confirmacion y salud) |
| El saldo | Botcake > Configuracion > Facturacion | BOTCAKE AI con saldo (bot) o WhatsApp con 5 dolares o mas (confirmacion) |
| Los permisos | Que el usuario sea administrador de la pagina | Puede entrar a Botcake AI y a Configuracion |
| Las plantillas (confirmacion) | `mibot plantillas` | Las dos `APPROVED, UTILITY` |
| Lo montado | `mibot verificar` o `mibot verificar-confirmacion` | Todo `OK` |
| La version | El aviso de version nueva al abrir la sesion | No hay version nueva sin instalar |
| Las tablas de fallos | `08-cuando-falla.md` y la tabla de fallos de la guia del recorrido | El sintoma no esta en ninguna tabla |

**Si una comprobacion explica el problema, es configuracion:** se arregla con el usuario
siguiendo esa guia, y **no se reporta**. Si hay una version nueva, primero se actualiza y se
repite: puede que ya este arreglado (el buzon no acepta reportes de versiones viejas).

## Paso 3. Clasificar lo que queda

Solo puede ser una de dos cosas:

- **`fallo-plugin`**: un comando de `mibot` se cae con un error del propio programa
  (`TypeError`, `Cannot read properties`, un mensaje que no es de Botcake), o la guia dice que
  algo pasa y no pasa (por ejemplo, `mibot verificar` dice `OK` y el bot no hace lo que debe).
- **`cambio-botcake`**: un boton, una pantalla o una opcion que la guia nombra ya no existe o
  se llama distinto, o una llamada que funcionaba ahora responde un error nuevo (`404`, `500`,
  un `success:false` que no estaba).

Si no encaja en ninguna, no es un fallo para reportar: explicale al usuario lo que viste y
ayudalo con el camino manual (`08-cuando-falla.md`).

## Paso 4. Armar el reporte

Escribe un archivo `reporte-fallo.json` en la carpeta del proyecto, con esta forma:

```json
{
  "tipo": "fallo-plugin",
  "titulo": "Una linea que diga que fallo",
  "recorrido": "bot",
  "paso": "Fase 7, paso 8, mibot subir-kb",
  "que_hacia": "Lo que estaba haciendo, en dos o tres frases",
  "que_esperaba": "Lo que dice la guia que tenia que pasar",
  "que_paso": "Lo que paso de verdad",
  "comando": "mibot subir-kb 123 conocimiento.txt",
  "salida": "La respuesta del comando, copiada tal cual, sin resumir",
  "comprobaciones": [
    { "que": "mibot probar", "resultado": "Conexion correcta" },
    { "que": "Saldo BOTCAKE AI", "resultado": "8 dolares" },
    { "que": "mibot verificar", "resultado": "OK en todo menos la base de conocimiento" }
  ]
}
```

- `recorrido`: `bot`, `comentarios`, `confirmacion`, `salud` o `instalacion`.
- `salida`: **literal**. Es la prueba de que el fallo existe; un resumen no sirve.
- `comprobaciones`: **al menos tres**, las del paso 2, con su resultado real.
- No escribas la version, el sistema ni el identificador de la instalacion: los pone el comando.

## Paso 5. Ensenarlo y mandarlo con su si

```bash
mibot reportar reporte-fallo.json
```

Le pone la version del plugin, el sistema y un identificador anonimo de la instalacion,
**tapa los datos privados** (la llave de sesion, telefonos, correos, identificadores de
pagina y numeros largos) y te imprime el reporte tal como va a quedar. Ensenaselo al usuario
y dile: *"Esto es lo que se va a publicar. Es publico: cualquiera lo puede leer. Revisa que
no haya nada tuyo o de tus clientes. ¿Lo mando?"*

Solo con su si:

```bash
mibot reportar reporte-fallo.json --enviar
```

El buzon lo revisa otra vez y responde una de estas:

| Respuesta | Que significa |
|---|---|
| Reporte creado, con un enlace | Quedo publicado; dale el enlace al usuario |
| Ya habia un reporte igual | Se sumo su caso al que estaba abierto; dale ese enlace |
| Version vieja | Hay que actualizar el plugin y repetir el paso antes de reportar |
| Faltan datos o comprobaciones | Completa el archivo y vuelve a correr el comando |
| Limite | Ya se mandaron muchos reportes; se intenta otro dia |

Al terminar, borra `reporte-fallo.json`: ya esta publicado.
