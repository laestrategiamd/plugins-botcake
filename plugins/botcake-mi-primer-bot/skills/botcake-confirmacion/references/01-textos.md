# Fase 2: los textos y las plantillas

Son cuatro textos. Dos van a revision de Meta y dos no:

| Texto | Cuando sale | Revision de Meta |
|---|---|---|
| Plantilla de **confirmacion** | En cuanto entra el pedido | Si |
| Plantilla de **recordatorio** | A las 2 horas, si no respondio | Si |
| Mensaje de **gracias** | Cuando toca «Sí, confirmar» | No |
| Mensaje de **modificar** | Cuando toca «Modificar datos» | No |

Los dos mensajes no pasan por Meta porque salen justo despues de que el cliente toco un
boton: WhatsApp deja escribir libremente durante 24 horas despues de que el cliente hace
algo.

---

## Las reglas para que Meta las apruebe como Utilidad

Meta clasifica cada plantilla. Un aviso sobre **un pedido concreto** es Utilidad: barato y
sin limite de envios por persona. Si el texto suena a venta, Meta la pasa a Marketing y
`mibot` no deja montar con ella.

1. **Habla de un pedido concreto:** numero de pedido y producto. Sin eso no es un aviso.
2. **Nada que suene a venta:** ni descuentos, ni "aprovecha", ni "ultimas unidades", ni
   otros productos, ni urgencia para comprar.
3. **Sin el metodo de pago ni datos de envio** (transportadora, fecha de entrega, "envio
   gratis"). Ademas de acercarla a Marketing, son promesas que el mensaje no puede cumplir.
4. **Pocos emojis**, los de la marca. Uno o dos por plantilla.
5. **El texto no empieza ni termina con una variable** (Meta la rechaza), y cada variable
   lleva un ejemplo.
6. **Topes:** encabezado 60 caracteres y sin variables, texto 1024, cada boton 25.
7. **Los botones son respuestas rapidas** y se llaman igual en las dos plantillas: «Sí,
   confirmar» y «Modificar datos». Si el usuario quiere otras palabras, se cambian en
   `plantillas.boton_confirmar` y `boton_modificar` antes de enviar.

---

## Las variables: de donde sale cada dato

En el texto de la plantilla los datos del pedido van como `{{1}}`, `{{2}}`... y en
`mi-confirmacion.json`, la lista `variables` dice que dato del POS va en cada numero, en
orden. Los que se usan:

| Del POS | Que es |
|---|---|
| `FULL_NAME` | Nombre del cliente en el pedido |
| `ORDER_ID` | Numero del pedido |
| `ITEMS` | Productos del pedido |
| `COD` | Lo que se cobra al entregar (contra entrega) |
| `FULL_ADDRESS` | Direccion de entrega |
| `PHONE_NUMBER` | Telefono del cliente |

**Si la tienda NO cobra contra entrega**, `COD` sale en cero: se quita la linea del total
de las dos plantillas y `COD` de las dos listas `variables`, y se renumeran las demas. Por
ejemplo, la confirmacion quedaria con `["FULL_NAME", "ORDER_ID", "ITEMS", "FULL_ADDRESS", "PHONE_NUMBER"]`
y `{{1}}` a `{{5}}`.

`mibot crear-plantillas` revisa que el numero de variables del texto, de la lista y de los
ejemplos coincida antes de mandar nada.

---

## Un ejemplo completo

Marca inventada, para que veas el tono: **Huerto Sol**, plantas y macetas, trato de tu,
emojis 🌱🪴✨, cobra contra entrega. Adaptalo a la marca del usuario; no lo copies.

**Plantilla de confirmacion** (`confirmacion_pedido`)

- Encabezado: `Confirma tu pedido`
- Texto:

```
Hola {{1}} 🌱, recibimos tu pedido en Huerto Sol. Antes de prepararlo, revisa que tus datos estén bien:

Pedido N° {{2}}
Producto(s): {{3}}
Total: {{4}}
Dirección: {{5}}
Teléfono: {{6}}

¿Está todo correcto?
```

- Ejemplos: `Carolina`, `1024`, `Maceta de barro x2`, `$89.900`, `Calle 45 #12-30, Bogotá`, `300 123 4567`
- Variables: `["FULL_NAME", "ORDER_ID", "ITEMS", "COD", "FULL_ADDRESS", "PHONE_NUMBER"]`

**Plantilla de recordatorio** (`recordatorio_confirmacion`)

- Encabezado: `Tu pedido sigue pendiente`
- Texto:

```
Hola {{1}}, tu pedido N° {{2}} de Huerto Sol sigue sin confirmar.

Producto(s): {{3}}
Total: {{4}}

Confírmalo con el botón de abajo para poder prepararlo 🪴
```

- Ejemplos: `Carolina`, `1024`, `Maceta de barro x2`, `$89.900`
- Variables: `["FULL_NAME", "ORDER_ID", "ITEMS", "COD"]`

**Mensaje de gracias**

```
¡Gracias, {FIRST_NAME}! Tu pedido quedó confirmado ✨ Si necesitas algo, escríbenos por aquí.
```

**Mensaje de modificar**

```
Claro, {FIRST_NAME}. Cuéntanos qué dato quieres cambiar (dirección, teléfono o producto) y alguien del equipo lo actualiza.
```

En los dos mensajes, `{FIRST_NAME}` es el primer nombre del pedido; `mibot` lo convierte en
la pastilla de nombre de Botcake. Si el equipo solo atiende en un horario, el de modificar
lo dice ("te respondemos de lunes a sabado, de 8 a 6"). No prometas nada que el sistema no
hace: este recorrido no manda avisos de envio.

---

## Como se los ensenas

En el chat, **como los va a ver el cliente**: con los ejemplos puestos en lugar de
`{{1}}`, `{{2}}`..., el encabezado arriba y los dos botones abajo. Despues, en una linea,
que dato del pedido sale en cada hueco. Esperas su aprobacion; lo que quiera cambiar, lo
cambias y se lo vuelves a ensenar.

Aprobados, los guardas en `mi-confirmacion.json`: `encabezado`, `cuerpo` (con `{{n}}`),
`ejemplos` y `variables` de cada plantilla, los dos `mensajes`, y
`plantillas.aprobadas_por_el_usuario: true`.

---

## Mandarlas a Meta

Antes, mira que nombres ya existen en la cuenta:

```bash
mibot plantillas
```

Si ya hay una `confirmacion_pedido` o `recordatorio_confirmacion` (de otro sistema o de un
intento anterior), cambia el `nombre` en `mi-confirmacion.json` (por ejemplo terminado en
`_2`): Meta no deja dos plantillas con el mismo nombre. Despues:

```bash
mibot crear-plantillas
```

Revisa los textos, las manda y relee lo que dice Meta. Ensenale al usuario lo que respondio,
por ejemplo:

```
- confirmacion_pedido: enviada a Meta
- recordatorio_confirmacion: enviada a Meta

Estado segun Meta:
  confirmacion_pedido: PENDING, UTILITY
    Meta la esta revisando. Tarda de minutos a 48 horas.
```

`PENDING` es "en revision". Cuando las dos digan `APPROVED, UTILITY`, se puede montar.

**Si Meta la rechaza o la pasa a Marketing:** se corrige el texto con el usuario siguiendo
las reglas de arriba, se le cambia el `nombre` (terminado en `_2`) y se vuelve a correr
`mibot crear-plantillas`. La vieja se queda en la cuenta sin usarse; no hace falta borrarla.

**Cierra la tanda 1 aqui**, con la frase de la espera de Meta (ver `SKILL.md`).
