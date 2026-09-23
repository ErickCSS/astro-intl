import { quickStartFiles as files } from "./quick-start.mjs";

const block = (file, lang) => ({ file, lang, code: files[file] });
const pageCode = (body, expression) => `---
import { setRequestLocale, getTranslations } from "astro-intl";

export function getStaticPaths() {
  return [{ params: { lang: "en" } }, { params: { lang: "es" } }];
}

await setRequestLocale(Astro.url);
${body}
---

${expression}`;
const requestCode = `import { defineRequestConfig } from "astro-intl";
import en from "./messages/en.json";
import es from "./messages/es.json";

const messages = { en, es };

export default defineRequestConfig(async (locale) => {
  if (locale !== "en" && locale !== "es") {
    throw new Error("Unsupported locale: " + locale);
  }
  return { locale, messages: messages[locale] };
});`;

export const guideLabels = {
  es: {
    start: "Introducción",
    everyday: "Traducciones",
    advanced: "Guías avanzadas",
    integrations: "Integraciones",
    reference: "Referencia",
    "quick-start": "Inicio rápido",
    usage: "Traducciones y variables",
    "file-structure": "Estructura de archivos",
    examples: "Ejemplos",
    "message-loading": "Carga personalizada",
    middleware: "Middleware y SSR",
    routing: "Rutas traducidas",
    "auto-redirect": "Redirección automática",
    "rich-text": "Contenido enriquecido",
    react: "React",
    svelte: "Svelte",
    configuration: "Opciones de configuración",
    installation: "Instalación",
    api: "API",
    next: "Siguiente paso",
    overview: "Documentación",
    prerequisite: "Antes de continuar",
  },
  en: {
    start: "Introduction",
    everyday: "Translations",
    advanced: "Advanced guides",
    integrations: "Integrations",
    reference: "Reference",
    "quick-start": "Quick start",
    usage: "Translations and variables",
    "file-structure": "File structure",
    examples: "Examples",
    "message-loading": "Custom message loading",
    middleware: "Middleware and SSR",
    routing: "Translated routes",
    "auto-redirect": "Automatic redirects",
    "rich-text": "Rich text",
    react: "React",
    svelte: "Svelte",
    configuration: "Configuration options",
    installation: "Installation",
    api: "API",
    next: "Next step",
    overview: "Documentation",
    prerequisite: "Before you continue",
  },
};
export const guideGroups = [
  { label: "start", pages: ["quick-start"] },
  { label: "everyday", pages: ["usage", "file-structure", "examples"] },
  {
    label: "advanced",
    pages: [
      "message-loading",
      "middleware",
      "routing",
      "auto-redirect",
      "rich-text",
    ],
  },
  { label: "integrations", pages: ["react", "svelte"] },
  { label: "reference", pages: ["installation", "configuration", "api"] },
];
export const nextPages = {
  "quick-start": "usage",
  usage: "file-structure",
  "file-structure": "examples",
  examples: "rich-text",
  "message-loading": "middleware",
  middleware: "routing",
  routing: "auto-redirect",
  "auto-redirect": "api",
  "rich-text": "react",
  react: "svelte",
  svelte: "api",
  installation: "quick-start",
  configuration: "message-loading",
  api: "examples",
};

export function getGuide(slug, locale) {
  const es = locale === "es";
  const text = (a, b) => (es ? a : b);
  const section = (title, description, blocks = [], id) => ({
    title,
    description,
    blocks,
    id,
  });
  const json = (value) =>
    ["en", "es"].map((lang) => ({
      file: `src/i18n/messages/${lang}.json`,
      lang: "json",
      code: JSON.stringify(value[lang], null, 2),
    }));
  const guides = {
    "quick-start": {
      intro: text(
        "Vas a mostrar «Hola» en /es/ y «Hello» en /en/, con enlaces para cambiar de idioma. Parte de un proyecto Astro estático que ya funciona. Solo necesitas dos archivos JSON, la integración y una página.",
        "You will display “Hola” at /es/ and “Hello” at /en/, with links to switch languages. Start with an existing, working static Astro project. You only need two JSON files, the integration and one page.",
      ),
      sections: [
        section(
          text("1. Instala astro-intl", "1. Install astro-intl"),
          text(
            "Ejecuta el comando en la carpeta de tu proyecto, donde está package.json. Selecciona el gestor de paquetes de tu proyecto. El asistente de Astro te pedirá confirmar la instalación y la incorporación de la integración en astro.config.mjs.",
            "Run this in your project folder, alongside package.json. Select your project’s package manager. The Astro wizard asks you to confirm installation and adding the integration to astro.config.mjs.",
          ),
          [
            {
              file: "Terminal",
              commands: {
                npm: "npx astro add astro-intl",
                pnpm: "pnpm astro add astro-intl",
                yarn: "yarn astro add astro-intl",
              },
            },
          ],
          "install",
        ),
        section(
          text("2. Crea los mensajes", "2. Create your messages"),
          text(
            "Crea estas carpetas y archivos. greeting es la clave que usarás desde el código; su valor cambia según el idioma. Ambos archivos deben tener las mismas claves.",
            "Create these folders and files. greeting is the key your code will use; its value changes with the language. Both files must have the same keys.",
          ),
          [
            block("src/i18n/messages/en.json", "json"),
            block("src/i18n/messages/es.json", "json"),
          ],
          "messages",
        ),
        section(
          text("3. Conecta los mensajes", "3. Connect the messages"),
          text(
            "Completa la integración que añadió el asistente con las opciones de este ejemplo y añade los imports de mensajes. Conserva las demás integraciones y no añadas astroIntl(...) una segunda vez. locales enumera los idiomas y messages relaciona cada uno con su JSON. defaultLocale define el idioma predeterminado; no crea rutas ni redirige la raíz. El atributo with permite a Node cargar JSON desde este archivo. Este ejemplo se comprueba con Astro 7 y Node 22.12 o posterior.",
            "Complete the integration added by the wizard with the options below and add the message imports. Keep your other integrations and do not add astroIntl(...) a second time. locales lists the languages and messages connects each one to its JSON. defaultLocale sets the default language; it does not create routes or redirect the root. The with attribute lets Node load JSON from this file. This example is checked with Astro 7 and Node 22.12 or later.",
          ),
          [block("astro.config.mjs", "javascript")],
          "config",
        ),
        section(
          text("4. Crea la página traducida", "4. Create the translated page"),
          text(
            "Crea literalmente la carpeta [lang]. getStaticPaths genera /en/ y /es/ al compilar. setRequestLocale lee el idioma de la URL y carga sus mensajes; espera a que termine antes de llamar a getTranslations. t('greeting') obtiene el texto. No necesitas un layout ni middleware para este ejemplo.",
            "Create a folder literally named [lang]. getStaticPaths generates /en/ and /es/ during the build. setRequestLocale reads the language from the URL and loads its messages; await it before calling getTranslations. t('greeting') reads the text. This example needs neither a layout nor middleware.",
          ),
          [block("src/pages/[lang]/index.astro", "astro")],
          "page",
        ),
        section(
          text("5. Abre los dos idiomas", "5. Open both languages"),
          text(
            "Inicia el servidor y abre la dirección que muestra la terminal, añadiendo /es/ o /en/. Debes ver Hola y Hello, respectivamente. Prueba los enlaces de idioma. La página que ya tengas en / no cambia. Si cambias astro.config.mjs, reinicia el servidor.",
            "Start the server and open the address printed in the terminal, adding /es/ or /en/. You should see Hola and Hello respectively. Try the language links. Your existing page at / stays as it is. Restart the server after changing astro.config.mjs.",
          ),
          [
            {
              file: "Terminal",
              commands: {
                npm: "npm run dev",
                pnpm: "pnpm dev",
                yarn: "yarn dev",
              },
            },
          ],
          "verify",
        ),
        section(
          text("6. Añade otra traducción", "6. Add another translation"),
          text(
            "Añade farewell a ambos JSON y úsala en la misma página, debajo del h1. Cada texto nuevo sigue esta secuencia: misma clave en todos los idiomas, valores traducidos y una llamada a t().",
            "Add farewell to both JSON files and use it in the same page below the h1. Every new text follows this sequence: the same key in all languages, translated values and a call to t().",
          ),
          [
            ...json({
              en: { greeting: "Hello", farewell: "Goodbye" },
              es: { greeting: "Hola", farewell: "Adiós" },
            }),
            {
              file: "src/pages/[lang]/index.astro — <body>",
              lang: "astro",
              code: '<p>{t("farewell")}</p>',
            },
          ],
          "next-translation",
        ),
        section(
          text("Si algo no aparece", "If something is missing"),
          text(
            "Un 404 en /es/ suele indicar que falta [lang]/index.astro o su getStaticPaths. Si aparece una clave en vez del texto, revisa que exista en ambos JSON. Si falta el contexto del idioma, comprueba el await setRequestLocale antes de getTranslations. No es necesario configurar el i18n nativo de Astro para este recorrido.",
            "A 404 at /es/ usually means [lang]/index.astro or its getStaticPaths is missing. If you see a key instead of text, check that it exists in both JSON files. If the language context is missing, check that await setRequestLocale comes before getTranslations. You do not need Astro’s built-in i18n configuration for this tutorial.",
          ),
          [],
          "troubleshooting",
        ),
      ],
    },
    usage: {
      intro: text(
        "Continúa desde Inicio rápido. Mantén la misma configuración y sustituye los mensajes y la página por los ejemplos siguientes.",
        "Continue from Quick start. Keep the same configuration and replace the messages and page with the following examples.",
      ),
      sections: [
        section(
          text(
            "Mensajes con variables y secciones",
            "Messages with variables and sections",
          ),
          text(
            "Una variable reserva un espacio para un valor. Un namespace agrupa claves relacionadas dentro de un objeto, como nav. Mantén la misma estructura en los dos idiomas.",
            "A variable reserves a place for a value. A namespace groups related keys in an object such as nav. Keep the same structure in both languages.",
          ),
          json({
            en: { greeting: "Hello, {name}!", nav: { home: "Home" } },
            es: { greeting: "Hola, {name}!", nav: { home: "Inicio" } },
          }),
        ),
        section(
          text("Traduce desde la página", "Translate in your page"),
          text(
            "getTranslations() lee desde la raíz; getTranslations('nav') limita las claves a nav. Inicializa el idioma en la página antes de traducir. Un layout usado dentro de la página no inicializa retroactivamente su frontmatter.",
            "getTranslations() reads from the root; getTranslations('nav') scopes keys to nav. Initialize the language in the page before translating. A layout used inside a page cannot initialize that page’s frontmatter retroactively.",
          ),
          [
            {
              file: "src/pages/[lang]/index.astro",
              lang: "astro",
              code: pageCode(
                'const t = getTranslations();\nconst tNav = getTranslations("nav");',
                '<h1>{t("greeting", { name: "Ana" })}</h1>\n<a href={`/${Astro.params.lang}/`}>{tNav("home")}</a>',
              ),
            },
          ],
        ),
        section(
          text("Valores aceptados", "Accepted values"),
          text(
            "Las variables aceptan string, number y boolean. Si omites una variable o pasas null/undefined, el marcador permanece en el texto. Para etiquetas HTML y componentes, continúa en Contenido enriquecido.",
            "Variables accept string, number and boolean. If you omit a variable or pass null/undefined, its placeholder stays in the text. For HTML tags and components, continue to Rich text.",
          ),
        ),
      ],
    },
    "file-structure": {
      intro: text(
        "Esta es toda la estructura necesaria para el ejemplo inicial. Los nombres en messages deben coincidir con los imports de tu configuración.",
        "This is the entire structure needed for the initial example. Names in messages must match the imports in your configuration.",
      ),
      sections: [
        section(
          text("Archivos mínimos", "Required files"),
          text(
            "astro.config.mjs conecta idiomas y mensajes. Los JSON guardan los textos. La página genera las dos URLs y elige el idioma antes de traducir.",
            "astro.config.mjs connects languages and messages. JSON files hold the text. The page generates both URLs and selects the language before translating.",
          ),
          [
            {
              file: text("Estructura mínima", "Minimal structure"),
              lang: "text",
              code: "astro.config.mjs\nsrc/\n  i18n/messages/\n    en.json\n    es.json\n  pages/[lang]/\n    index.astro",
            },
          ],
        ),
        section(
          text(
            "Archivos opcionales al crecer",
            "Optional files as your project grows",
          ),
          text(
            "layouts/Layout.astro comparte HTML; components/ contiene piezas reutilizables. i18n/request.ts solo hace falta si eliges un cargador personalizado. middleware.ts centraliza la inicialización antes del render. i18n/routing.ts organiza rutas traducidas. Ninguno es un requisito para el inicio rápido.",
            "layouts/Layout.astro shares HTML; components/ holds reusable pieces. i18n/request.ts is only needed when you choose a custom loader. middleware.ts centralizes initialization before rendering. i18n/routing.ts organizes translated routes. None is required for the quick start.",
          ),
        ),
      ],
    },
    examples: {
      intro: text(
        "Estos ejemplos amplían el inicio rápido. Conserva su configuración, sus dos JSON y getStaticPaths; los fragmentos indican dónde añadir cada cambio.",
        "These examples extend the quick start. Keep its configuration, both JSON files and getStaticPaths; each snippet indicates where to add the change.",
      ),
      sections: [
        section(
          text("Un componente reutilizable", "A reusable component"),
          text(
            "El componente recibe el texto ya traducido. Así no necesita inicializar un idioma ni conocer la configuración.",
            "The component receives already translated text. It does not need to initialize a language or know about the configuration.",
          ),
          [
            {
              file: "src/components/Greeting.astro",
              lang: "astro",
              code: "---\ninterface Props { text: string; }\nconst { text } = Astro.props;\n---\n<h1>{text}</h1>",
            },
            {
              file: "src/pages/[lang]/index.astro",
              lang: "astro",
              code: pageCode(
                "const t = getTranslations();",
                '<Greeting text={t("greeting")} />',
              ).replace(
                "import { setRequestLocale",
                'import Greeting from "../../components/Greeting.astro";\nimport { setRequestLocale',
              ),
            },
          ],
        ),
        section(
          text("Autocompletado de claves", "Key autocomplete"),
          text(
            "En el frontmatter de la página, después de inicializar el idioma, usa el tipo de tu JSON como argumento genérico. Esto permite comprobar claves como greeting con TypeScript.",
            "In the page frontmatter, after initializing the language, use your JSON type as a generic argument. This lets TypeScript check keys such as greeting.",
          ),
          [
            {
              file: "src/pages/[lang]/index.astro — frontmatter",
              lang: "typescript",
              code: 'import type en from "../../i18n/messages/en.json";\n\nconst t = getTranslations<typeof en>();\nconst greeting = t("greeting");',
            },
          ],
        ),
      ],
    },
    configuration: {
      intro: text(
        "Consulta estas opciones después de completar Inicio rápido. No son pasos adicionales de instalación.",
        "Look up these options after completing Quick start. They are not additional installation steps.",
      ),
      sections: [
        section(
          text("Configuración básica completa", "Complete basic configuration"),
          text(
            "Este es el mismo ejemplo del inicio. Añade la integración a tu configuración existente.",
            "This is the same example as the tutorial. Add the integration to your existing configuration.",
          ),
          [block("astro.config.mjs", "javascript")],
        ),
        section(
          "defaultLocale / locales",
          text(
            "defaultLocale es 'en' si se omite. locales enumera los idiomas permitidos; usa la misma lista al generar las páginas. La integración no genera [lang] ni getStaticPaths por ti.",
            "defaultLocale is 'en' when omitted. locales lists allowed languages; use the same list when generating pages. The integration does not generate [lang] or getStaticPaths for you.",
          ),
        ),
        section(
          "messages",
          text(
            "Relaciona cada idioma con un objeto de mensajes o una función que lo carga. Para empezar, usa los objetos JSON importados del ejemplo. No necesitas request.ts.",
            "Maps each language to a message object or loader function. Start with the imported JSON objects shown above. You do not need request.ts.",
          ),
        ),
        section(
          "messagesDir",
          text(
            "Alternativa a messages que carga archivos por idioma desde un directorio. Requiere locales. No la combines con messages: messages tiene prioridad. Su resolución de rutas y disponibilidad de JSON en producción requieren una comprobación específica del proyecto; el inicio recomendado usa imports explícitos.",
            "An alternative to messages that loads locale files from a directory. Requires locales. Do not combine it with messages: messages takes precedence. Path resolution and JSON availability in production need project-specific verification; the recommended tutorial uses explicit imports.",
          ),
        ),
        section(
          "routes",
          text(
            "Mapa opcional de URLs traducidas. Consulta Rutas traducidas y configura su middleware; no hace falta para tener /es/ y /en/.",
            "Optional map of translated URLs. See Translated routes and configure its middleware; it is not needed for /es/ and /en/.",
          ),
        ),
        section(
          "enabled",
          text(
            "Por defecto true. Controla los hooks de la integración. No lo uses como sustituto de quitar las llamadas de traducción de tus páginas.",
            "Defaults to true. Controls integration hooks. It does not replace removing translation calls from your pages.",
          ),
        ),
      ],
    },
    "message-loading": {
      intro: text(
        "Úsala cuando necesites resolver mensajes con lógica propia o cargarlos desde otra fuente. Requiere entender los JSON y setRequestLocale del inicio. Para archivos locales pequeños, conserva messages.",
        "Use this when you need custom logic or another source for messages. Requires familiarity with the tutorial’s JSON files and setRequestLocale. For small local files, keep messages.",
      ),
      sections: [
        section(
          text("Registra un cargador", "Register a loader"),
          text(
            "Este ejemplo usa los mismos JSON del inicio. defineRequestConfig registra la función; solo declarar el archivo no la ejecuta. Importarlo antes de inicializar el idioma activa el cargador.",
            "This example uses the tutorial’s JSON files. defineRequestConfig registers the function; merely creating the file does not execute it. Import it before initializing the language to activate the loader.",
          ),
          [
            {
              file: "src/i18n/request.ts",
              lang: "typescript",
              code: requestCode,
            },
          ],
        ),
        section(
          text("Úsalo en una página estática", "Use it in a static page"),
          text(
            "Conserva locales y defaultLocale en la integración y retira messages y sus imports de astro.config.mjs al adoptar este enfoque. El cargador explícito tiene prioridad sobre messages; evita mantener dos fuentes de configuración.",
            "Keep locales and defaultLocale in the integration and remove messages and its imports from astro.config.mjs when adopting this approach. An explicit loader takes precedence over messages; avoid keeping two configuration sources.",
          ),
          [
            {
              file: "src/pages/[lang]/index.astro",
              lang: "astro",
              code: pageCode(
                "const t = getTranslations();",
                '<h1>{t("greeting")}</h1>',
              ).replace(
                "import { setRequestLocale",
                'import "../../i18n/request";\nimport { setRequestLocale',
              ),
            },
          ],
        ),
      ],
    },
    middleware: {
      intro: text(
        "Úsala cuando varias páginas necesitan traducciones antes de renderizar o cuando tu aplicación usa SSR en Node. Requiere haber completado el inicio y conocer las rutas [lang]. El middleware puede usarse también al prerenderizar.",
        "Use this when multiple pages need translations before rendering or your application uses Node SSR. Complete the tutorial and understand [lang] routes first. Middleware can also run during prerendering.",
      ),
      sections: [
        section(
          text("Carga mensajes en el runtime", "Load messages in the runtime"),
          text(
            "Para SSR registra los mensajes dentro del código de la aplicación, mediante este archivo, en lugar de depender del proceso que lee astro.config.mjs. Conserva los dos JSON del inicio. Retira messages y sus imports de la configuración al cambiar a este enfoque.",
            "For SSR, register messages in application code through this file, instead of relying on the process reading astro.config.mjs. Keep both tutorial JSON files. Remove messages and its imports from the configuration when switching to this approach.",
          ),
          [
            {
              file: "src/i18n/request.ts",
              lang: "typescript",
              code: requestCode,
            },
          ],
        ),
        section(
          text("Inicializa antes de renderizar", "Initialize before rendering"),
          text(
            "Crea el middleware. Si ya tienes uno, combina los handlers con sequence de astro:middleware; no lo sobrescribas. createIntlMiddleware prepara y aísla las traducciones para todo el render de cada petición.",
            "Create the middleware. If you already have one, combine handlers with sequence from astro:middleware; do not overwrite it. createIntlMiddleware prepares and isolates translations for the entire render of each request.",
          ),
          [
            {
              file: "src/middleware.ts",
              lang: "typescript",
              code: 'import "./i18n/request";\nimport { createIntlMiddleware } from "astro-intl/middleware";\n\nexport const onRequest = createIntlMiddleware({\n  locales: ["en", "es"],\n  defaultLocale: "en",\n});',
            },
          ],
        ),
        section(
          text(
            "Lee traducciones en la página",
            "Read translations in the page",
          ),
          text(
            "Con este middleware activo, elimina setRequestLocale de las páginas y llama directamente a getTranslations. En páginas estáticas conserva getStaticPaths. En rutas renderizadas bajo demanda usa la configuración SSR de Astro y un adaptador Node compatible, y no exportes getStaticPaths. El soporte de aislamiento requiere AsyncLocalStorage; un runtime SSR sin esta capacidad no es compatible.",
            "With this middleware active, remove setRequestLocale from pages and call getTranslations directly. Keep getStaticPaths for static pages. For on-demand routes, use Astro’s SSR configuration and a compatible Node adapter, and do not export getStaticPaths. Isolation requires AsyncLocalStorage; an SSR runtime without it is unsupported.",
          ),
        ),
      ],
    },
  };
  return guides[slug];
}
