# Fase 0: el filtro de entrada

Este recorrido **solo arranca si se cumple todo lo de esta pagina**. Si falta algo, le
explicas al usuario cual, por que hace falta y como se consigue, y **no sigues**. Cada
requisito que se descubre tarde cuesta dinero (plantillas enviadas que no sirven) o deja
montado un sistema que no manda nada y no avisa.

Preguntalo todo de una vez, en una sola lista, y despues compruebas lo que se pueda
comprobar tu. Guarda cada respuesta en `mi-confirmacion.json` (`requisitos`).

---

## 1. WhatsApp API conectado a Botcake

**Por que:** el mensaje de confirmacion le llega a un cliente que no ha escrito antes, y
WhatsApp solo deja hacer eso con una plantilla revisada por Meta. Las plantillas existen
en WhatsApp API; un WhatsApp normal o la app WhatsApp Business no sirven.

**Como se comprueba:** primero la llave de sesion (pasos 1 a 4 de la Fase 6 de
`../botcake-mi-primer-bot/references/06-montaje.md`; si ya existe `.botcake-sesion` en la
carpeta, basta con `mibot probar`). Despues:

```bash
mibot paginas
```

La pagina de WhatsApp API tiene un identificador que **empieza por `waba_`**. Si no hay
ninguna, no esta conectado. Eligela con `mibot pagina <identificador>` si no es la que ya
estaba elegida.

**Si no lo tiene:** conectar WhatsApp API pide un Business Manager de Meta y un numero que
no este en uso en WhatsApp normal, y puede tardar dias. Los pasos estan en
`../botcake-mi-primer-bot/references/00b-arranque-desde-cero.md`, bloque 3, apartado
WhatsApp API. El usuario hace los clics; tu lo acompanas.

## 2. Pedidos que ya llegan al POS de Pancake

**Por que:** el mensaje se llena solo con los datos del pedido (nombre, numero de pedido,
producto, monto, direccion, telefono) y lo dispara el POS cuando entra un pedido nuevo. Si
los pedidos no estan en el POS, no hay nada que confirmar.

Sirve cualquiera de estas entradas: pedidos que el equipo crea en el POS, pedidos que
llegan de una tienda conectada (Shopify, WooCommerce, Tiendanube u otra), o del formulario
de una landing de Webcake.

**Como se comprueba:** pidele que abra `pos.pancake.vn`, entre a su tienda y vaya a
**Pedidos**. Preguntale:

- Si ve los pedidos de esta semana.
- Si cada pedido trae **el telefono del cliente completo**, con el codigo del pais. El
  mensaje le llega a ese numero: sin telefono no hay a quien escribir.
- De donde vienen (la columna o el filtro de origen). Guardalo en `origen_de_los_pedidos`:
  hace falta en la Fase 4.

**Si no llegan:** este recorrido no es para ahora. Conectar la tienda al POS es otro
trabajo, que depende de la plataforma de la tienda. Diselo asi: *"Primero los pedidos
tienen que entrar a Pancake. Cuando los veas en el POS con el telefono del cliente,
retomamos."*

## 3. Saldo para enviar plantillas

**Por que:** cada mensaje de plantilla lo cobra Meta, y Pancake lo descuenta de la cuenta
prepago de la billetera. Sin saldo no sale ningun mensaje, y nadie avisa.

**Como se comprueba:** en Botcake, **Configuracion > Facturacion** (la direccion termina en
`/settings/billing`). Ahi esta el saldo de la cuenta prepago, con una linea para WhatsApp.
Meta exige **minimo 5 dolares** para enviar plantillas. Pidele que te diga cuanto sale.
El precio de cada mensaje lo pone Meta segun el pais (en Utilidad son centavos de dolar);
no des una cifra exacta: esta en la tabla de precios de Meta y cambia.

**Si no hay billetera o esta en cero:** la conecta y la recarga **el dueno de la cuenta**,
porque es facturacion. Los pasos estan en `../botcake-mi-primer-bot/references/00b-arranque-desde-cero.md`,
bloque 5 (incluye vincular la billetera a la cuenta de WhatsApp). Los datos de pago los
escribe el, nunca tu.

## 4. Dos plantillas aprobadas por Meta como Utilidad

**Por que:** son los dos mensajes que salen sin que el cliente haya escrito: la
confirmacion y el recordatorio. Meta revisa cada una y la clasifica. Como **Utilidad**
(un aviso sobre un pedido concreto) cuestan poco; si Meta la pasa a **Marketing**, cada
envio cuesta varias veces mas y Meta limita cuantos mensajes de Marketing recibe cada persona.

**Como se consigue:** se escriben en la Fase 2 con el usuario, se mandan con
`mibot crear-plantillas` y se espera la respuesta de Meta. **El montaje no empieza hasta
que las dos esten aprobadas como Utilidad**: `mibot confirmacion` lo revisa y se niega si
no. Aqui en la Fase 0 solo se lo explicas, para que sepa que habra una espera de hasta 48
horas entre la tanda 1 y la 2.

## Ademas

- **Node.js instalado** (`node -v`). Si falta: `nodejs.org`, version LTS, y reabrir la app
  de Claude. En Windows, ademas, Git para Windows.
- **Permisos de administrador** en la pagina de WhatsApp en Botcake y en la tienda del POS:
  en la Fase 4 hay que crear una regla en los ajustes del POS.

## Una pregunta antes de seguir

*"Hoy, cuando alguien hace un pedido, ¿le llega algun mensaje automatico por WhatsApp?"*

Si dice que si, hay que saber de donde sale antes de montar otro: con dos sistemas
encendidos el cliente recibe dos confirmaciones. Puede venir de otra secuencia de Botcake
(Botcake > Secuencias), de una regla del POS (Ajustes > Notificacion) o de otra
herramienta. Guardalo en `otra_confirmacion_activa`. No lo apagues tu: en la Fase 4 se
decide con el usuario cual se queda.

---

## Como cierras la Fase 0

Con todo en verde, le dices en una frase que tiene y que sigue: *"Tienes todo lo necesario.
Ahora escribimos los mensajes."* Guardas `mi-confirmacion.json` (`fase_actual: 1`) y pasas
a la Fase 1.
