# 🍿 Botanas Mony

Menú digital e interactivo para el puesto de Botanas Mony. Los clientes arman su
pedido, personalizan ingredientes y lo mandan por WhatsApp; Mony administra
precios, existencias y horarios desde el mismo sitio.

**Stack:** React 19 + Vite · Tailwind CSS 4 · Firebase Realtime Database + Auth · Vercel

---

## 🚀 Puesta en marcha

```bash
npm install
npm run dev
```

> Después de actualizar el proyecto hay que correr `npm install` una vez: se
> agregó `@tailwindcss/vite` y se quitaron `postcss` y `autoprefixer`, que ya no
> hacen falta con Tailwind 4.

---

## 🔐 Configurar el acceso de administración (importante)

Antes, la contraseña del panel estaba escrita dentro del código, así que viajaba
en el bundle público: cualquiera podía leerla desde las herramientas del
navegador y cambiar precios o cerrar la tienda. Ahora el panel usa **Firebase
Authentication** y la base solo acepta escrituras de un usuario con sesión
iniciada.

Hay que hacer esto una sola vez en la [consola de Firebase](https://console.firebase.google.com/):

1. **Authentication → Sign-in method → Email/Password → Habilitar.**
2. **Authentication → Users → Add user.** Crea la cuenta del negocio (por
   ejemplo `mony@botanasmony.com`) con una contraseña larga. Ese correo y esa
   contraseña son los que se usan en el botón ⚙️ de la app.
3. **Realtime Database → Rules.** Pega el contenido de `database.rules.json` y
   publica. Con esas reglas cualquiera puede *leer* el menú, pero solo la cuenta
   autenticada puede *escribir*.

Después de esto, cambia la contraseña vieja si la usabas en otro lado: estuvo
publicada en el repositorio y en el sitio.

---

## 🕐 Horario: la tienda se abre y se cierra sola

No hay que entrar a diario a abrir o cerrar. La regla general vive en la
pestaña **Entrega** del panel:

| Ajuste | Valor de fábrica |
| --- | --- |
| Horario | 12:00 a 20:00 |
| Días que abre | todos |
| Recoger en el puesto | solo sábados |
| Envío a domicilio | todos los días que abra |

La app revisa la hora cada medio minuto, así que la tienda cambia de estado
sin que nadie recargue la página, y el letrero le dice al cliente qué esperar
("Abre hoy a las 12:00 pm", "Abre el sábado…").

### Cambios de un solo día

En la pestaña **Tienda** está la sección "Solo por hoy": cerrar porque no se
va a vender, abrir un lunes cualquiera, activar el recoger entre semana. Todo
eso se guarda con la fecha y **caduca a medianoche**, así que al día siguiente
vuelve a mandar el horario automático y nada se queda cerrado por olvido.

Si se apaga el horario automático, la tienda queda **cerrada** y solo abre
cuando se abra a mano cada día (nunca al revés: así no se queda abierta las 24
horas sin querer).

---

## 📁 Estructura

```
src/
├─ lib/                    Lógica sin interfaz (fácil de probar y reutilizar)
│  ├─ firebase.js          Conexión, escrituras, suscripciones y auth
│  ├─ schedule.js          Generación de horarios disponibles
│  ├─ whatsapp.js          Armado del mensaje del pedido
│  └─ format.js            Dinero, fechas, clases y ids
├─ context/                Estado compartido
│  ├─ StoreContext.jsx     Productos, ingredientes, horarios, sesión de admin
│  ├─ CartContext.jsx      Carrito con cantidades, persistente
│  └─ ToastContext.jsx     Avisos y diálogos de confirmación propios
├─ components/
│  ├─ ui/                  Modal, Button, QuantityStepper
│  ├─ AdminModal/          Panel dividido en pestañas
│  └─ …                    Un componente por pantalla del flujo
├─ data/products.js        Catálogo semilla y grupos de ingredientes
└─ index.css               Tokens de marca de Tailwind 4
```

Los estilos viven en las clases de Tailwind de cada componente; los colores,
tipografías, sombras y animaciones están centralizados en el bloque `@theme` de
`src/index.css`.

---

## 🌱 Sembrar la base de datos

`src/initFirebase.js` sube el catálogo del código a Firebase. Ya no se ejecuta
al importarse (antes, un import por accidente sobrescribía los precios reales).
Con la sesión de admin abierta, desde la consola del navegador:

```js
import('/src/initFirebase.js').then((m) => m.seedFirebase())
```

---

## 🧾 Cómo llega el pedido

1. El cliente arma el carrito (con cantidades, extras y notas).
2. Elige recoger o envío, deja su nombre y la hora.
3. Se abre WhatsApp con el pedido ya redactado hacia el número del negocio.
4. Manda su comprobante de transferencia y Mony confirma.

El número de WhatsApp y los datos bancarios están en `src/data/products.js`.
