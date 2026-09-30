# Plugins de La Estrategia para Claude Code

Herramientas para trabajar con el ecosistema Pancake (Botcake, Webcake, CRM, POS)
desde Claude Code.

## Instalacion

En la app de Claude (pestana Code), pidele a Claude en el chat que instale el plugin, o
escribe en la terminal:

```
claude plugin marketplace add laestrategiamd/plugins-botcake
```

```
claude plugin install botcake-mi-primer-bot@la-estrategia
```

Despues, abre una sesion nueva. Funciona en Mac y en Windows.

Cada vez que abres una sesion, el plugin revisa si hay una version nueva publicada y, si
la hay, te lo avisa para que la actualices:

```
claude plugin marketplace update la-estrategia
```

```
claude plugin update botcake-mi-primer-bot@la-estrategia
```

Volver a instalarlo no lo actualiza: responde que ya esta instalado y deja la version vieja.

## Que hay aqui

### Mi primer bot con Pancake (`botcake-mi-primer-bot`)

Te acompana desde cero hasta tener un bot con inteligencia artificial respondiendo en tu
WhatsApp, Facebook o Instagram:

1. Te hace las preguntas sobre tu negocio.
2. Arma el prompt (las instrucciones del bot) y la base de conocimiento (sus datos).
3. Dibuja el diagrama del flujo y te lo ensena antes de construir nada.
4. Lo monta en Botcake.
5. Lo prueba contigo y solo entonces lo enciende.

Trabaja **por tandas**: guarda el avance en un archivo y se retoma en otra sesion
escribiendo *sigamos con mi bot*.

### Respuestas automaticas a comentarios (segundo recorrido)

Deja tu pagina de Facebook o tu cuenta de Instagram contestando sola a quien comenta:

1. Te pregunta por tu marca y tu WhatsApp, y escribe los textos para que los apruebes.
2. Monta la respuesta publica (seis textos que se turnan), el mensaje privado (cinco
   versiones al azar) y la moderacion que oculta comentarios con telefonos, enlaces o
   palabras de queja (y bloquea a quien escribe esas palabras).
3. Lo enciende solo cuando tu lo autorizas, y te guia en la prueba desde tu cuenta.

Se activa diciendo *quiero responder comentarios automaticamente* o *sigamos con mis
comentarios*. No necesita billetera ni saldo: no usa inteligencia artificial.

### Confirmacion de pedidos por WhatsApp (tercer recorrido)

Cuando entra un pedido nuevo a tu POS de Pancake, el cliente recibe por WhatsApp los datos
de su pedido con dos botones, «Sí, confirmar» y «Modificar datos»:

1. Revisa antes que tengas lo necesario, y si falta algo no empieza.
2. Escribe contigo los dos mensajes que revisa Meta (la confirmacion y un recordatorio) y
   los manda a aprobar.
3. Cuando Meta los aprueba, monta todo apagado: el recordatorio a las 2 horas para quien
   no respondio, y las marcas «Confirmado», «Asesor» y «Sin respuesta» para tu equipo.
4. Lo enciende solo cuando tu lo autorizas, conecta tu POS y lo prueba con un pedido a tu
   propio numero.

Se activa diciendo *quiero confirmar mis pedidos por WhatsApp* o *sigamos con mi
confirmacion*. Necesita WhatsApp API, que tus pedidos ya lleguen al POS de Pancake y saldo
en la billetera para enviar los mensajes.

### Revision de salud de tu WhatsApp (cuarto recorrido)

Revisa si tu numero de WhatsApp esta sano ante Meta, que puede bajarle la calificacion o
llevar a una restriccion, y que hacer:

1. Te pregunta que paso, si vienes con un problema, y te guia a mirar la calificacion de tu
   numero en Meta.
2. Revisa lo que tienes montado en Botcake (plantillas, secuencias, difusiones, el bot) en
   siete puntos, sin que tengas que exportar nada.
3. Te da el diagnostico en palabras sencillas y un plan por orden. No cambia nada sin tu
   permiso.

Se activa diciendo *revisa que mi WhatsApp este bien* o *mi WhatsApp tiene calidad baja*.

## Que necesitas antes de empezar

- Cuenta de Pancake con una pagina conectada (WhatsApp API, Facebook o Instagram). Una
  cuenta nueva trae 14 dias de prueba gratis: alcanzan para dejar el bot funcionando.
- Permisos de administrador en esa pagina.
- Para el bot que conversa: la billetera de Pancake conectada, con saldo en Botcake AI (la
  conecta el dueno de la cuenta). Para los comentarios no hace falta.
- Para la confirmacion de pedidos: WhatsApp API, los pedidos entrando al POS de Pancake y
  saldo para plantillas de WhatsApp en la billetera (minimo 5 dolares).
- Node.js instalado (`nodejs.org`, version LTS). En Windows, ademas, Git para Windows
  (`git-scm.com`).
- La app de Claude (pestana Code) o Claude Code en tu computador.

## Aviso

Este plugin trabaja sobre tu propia cuenta de Botcake, con tu sesion. No pide ni guarda
contrasenas: tu inicias sesion en el navegador que se abre. Antes de escribir nada en tu
cuenta baja un respaldo de lo que ya tienes.

Botcake es una plataforma de terceros y puede cambiar. Si algo deja de funcionar, el plugin
te lleva por el camino manual para que termines igual, y te pide que reportes el fallo.

## Licencia

MIT. Ver `LICENSE`.
