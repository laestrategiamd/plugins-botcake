# Arranque desde cero: crear la cuenta y conectar el canal

Usa esta guia cuando en la Fase 0 falte la cuenta de Pancake, la pagina conectada o la
suscripcion. Sale de la documentacion oficial de Pancake (sintetizada ago-2026).

**Las reglas de esta guia:**

- **El usuario hace TODO el mismo**: las cuentas, las contrasenas y los pagos son suyos.
  Tu le dictas pantalla por pantalla y el hace los clics. Nunca pidas una contrasena ni
  un dato de pago; nunca crees una cuenta por el.
- **Despues de cada bloque, pidele que te describa que ve** antes de seguir. Pancake y
  Meta cambian sus pantallas: si lo que ve no coincide con esta guia, que te describa la
  pantalla y adapta las instrucciones a lo que hay.
- Al terminar, **vuelve a la lista de la Fase 0** y comprueba los cinco requisitos otra vez.

---

## 1. Crear la cuenta de Pancake

1. Que entre a `pancake.vn` y busque el boton de iniciar sesion.
2. Hay tres formas oficiales de entrar: **con Facebook**, **con Instagram Business**, o
   **con Pancake ID** (una cuenta propia, que se puede registrar con Google o Apple).
3. **Recomiendale entrar CON FACEBOOK** si su negocio vive en Facebook o Instagram, y que
   lo haga **con el perfil que administra su pagina** (no un perfil personal cualquiera).
   Cuando Facebook pregunte que paginas compartir, que elija la opcion de **"todas las
   paginas actuales y futuras"** — es la recomendacion oficial y evita reconexiones despues.
4. Como saber que quedo: al terminar ve el **dashboard** de Pancake, con su nombre arriba
   y un boton para conectar plataformas.

## 2. La suscripcion

- Una cuenta nueva funciona **en modo de prueba** al principio. Para trabajar en serio se
  compra una suscripcion, que se elige segun **cuantas paginas, cuanto personal y por
  cuanto tiempo**.
- ⚠️ **La pagina tiene que quedar DENTRO del plan.** Pagar no basta: la pagina conectada
  se vincula a la suscripcion, y una pagina fuera del plan no recibe mensajes. Tras pagar,
  que compruebe que su pagina aparece activa dentro del plan.
- **El pago lo hace el usuario solo.** Tu le puedes decir donde esta la pantalla de planes;
  no le pidas ni el metodo de pago ni ningun dato de la tarjeta.

## 3. Conectar el canal

Pregunta cual va a usar el bot y ve a su seccion. Si va a usar varios, uno por uno.

### Facebook (Messenger)

Necesita ser **administrador de la pagina**. El flujo oficial, desde el dashboard:

1. **Conectar → Facebook** → iniciar sesion.
2. Elegir el **Business Manager** (si tiene) y las **paginas**.
3. Elegir tambien las cuentas de Instagram si quiere conectarlas de una vez.
4. Confirmar los permisos y **activar la pagina**.

Tropiezos conocidos (los dos salen en la doc oficial):

- **La pagina no aparece tras conectar:** suele estar **pendiente de activacion**. Que la
  seleccione y pulse **Activar** (puede tardar unos minutos).
- **Mas adelante, si el bot no responde en Messenger** aunque todo se vea bien: Meta solo
  deja que UNA aplicacion controle cada conversacion. La configuracion correcta es
  **Pancake como aplicacion predeterminada y Botcake como "aplicacion social"**, y se
  ajusta desde la configuracion de la propia pagina de Facebook (Messenger conversation
  routing). Guarda esta nota para la fase de pruebas.

Al conectar, Pancake trae las conversaciones de los **ultimos 14 dias**.

### Instagram

- La cuenta tiene que ser **profesional** (de empresa). Si es personal, se convierte
  gratis desde el telefono: **Instagram → Perfil → menu de las 3 lineas → Configuracion →
  Cuenta → Cambiar a cuenta profesional → elegir categoria**.
- Lo mas simple es conectarla **junto con Facebook** (paso 3 del bloque anterior), si el
  Instagram esta vinculado a la pagina de Facebook. Tambien existe la conexion directa
  solo-Instagram.
- **Si sale el error 124:** hay que darle permiso a los mensajes desde Facebook:
  Configuracion → Cuentas vinculadas → Instagram → activar **"Permitir el acceso a los
  mensajes de Instagram en la bandeja"**, y volver a entrar en Pancake.

### WhatsApp API

Es el canal mas exigente, y lo honesto es decirselo antes de empezar. Los requisitos
oficiales:

- Un **Business Manager de Meta verificado** (sin verificar funciona, pero con limites).
  La verificacion pide documentos del negocio y **puede tardar dias — depende de Meta, no
  del usuario ni de esta guia**.
- Un **numero de telefono que NO este en uso en WhatsApp normal**. Si lo estuvo, hay que
  borrar esa cuenta de WhatsApp en el telefono y esperar unos minutos antes de conectar.
- Ser **administrador** del Business Manager.

El flujo oficial: **Conectar → WhatsApp → Connect with WhatsApp Business** (se abre el
asistente de Meta). Ahi:

1. Elegir el portafolio de empresa (el verificado).
2. Crear la cuenta de WhatsApp Business nueva o usar una existente.
3. ⚠️ Si Meta ofrece conectar **"solo con nombre para mostrar" (sin numero)**, la doc
   oficial dice explicitamente **NO elegir eso**: hay que poner un numero real y
   verificarlo con el codigo.
4. Llenar **nombre para mostrar** (lo que ve el cliente), **categoria** y **sitio web** —
   si el negocio no tiene web, la doc oficial permite usar **el enlace de su pagina de
   Facebook o de su Instagram**.
5. Al terminar, esperar 1-2 minutos a que redirija (si se queda pegado, refrescar).

Despues de conectar hace falta la **billetera de Pancake** (siguiente bloque) para poder
enviar plantillas.

## 4. Entrar a Botcake por primera vez

**No hay una cuenta de Botcake aparte**: se entra con la misma identidad.

1. Ir a `botcake.io` e **iniciar sesion con Facebook** (el mismo perfil administrador) o
   con la cuenta de Pancake. Aceptar todos los permisos.
2. Elegir la plataforma (Messenger, Instagram, WhatsApp...).
3. **+ Conectar** → seleccionar la pagina → **Activar**.
4. Si la pagina no aparece en la lista: boton **Reconectar**.
5. Si Botcake ofrece su **asistente de inicio** (modo principiante / profesional), que
   elija **profesional**: este plugin lo va a guiar con su propio metodo y el asistente
   duplicaria el trabajo.

## 5. La billetera de Pancake (la conecta el dueno)

Ya sabes por la Fase 0 que **la conecta el dueno de la cuenta**, porque es facturacion.
Si el dueno es la misma persona que tienes al frente, estos son los pasos oficiales para
crearla:

1. **Account Management → Connect → Sign Up / Continue with Pancake → Pancake Wallet →
   + Create New**, moneda **USD**.
2. El paso de agregar tarjeta es **opcional** (sin tarjeta se recarga por transferencia).
   Como siempre: los datos de pago los escribe el, nunca tu.
3. Vincular la billetera a su cuenta de WhatsApp (en los ajustes de la billetera) si el
   canal es WhatsApp. Para enviar plantillas se necesita un **saldo minimo de 5 USD**.
4. El agente de IA de Botcake tambien cobra su consumo por esta billetera — por eso la
   Fase 0 la exige con saldo.

---

## Al terminar

Vuelve a `00-requisitos.md` y repasa los cinco requisitos uno por uno. Solo cuando los
cinco esten en verde se arranca la Fase 1. Guarda en `mi-bot.json` que canal conecto y
que quedo pendiente (por ejemplo, una verificacion de Meta en espera).
