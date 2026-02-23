# astro-intl

Sistema de internacionalización simple y type-safe para Astro, inspirado en next-intl.

## 🚀 Desarrollo

### Compilar el paquete

Antes de usar el paquete en el playground o en cualquier proyecto, debes compilarlo:

```bash
npm run build
```

Esto generará los archivos JavaScript y las declaraciones de tipos (`.d.ts`) en la carpeta `dist/`.

### Modo desarrollo

Para compilar automáticamente cuando hagas cambios:

```bash
npm run dev
```

### Después de compilar

Si estás trabajando en un monorepo con pnpm workspaces, después de compilar ejecuta:

```bash
pnpm install
```

Esto actualizará los enlaces simbólicos y los tipos estarán disponibles en los proyectos que usen el paquete.

## 📦 Estructura del Paquete

```
packages/integration/
├── src/
│   ├── core.ts          # Lógica principal
│   ├── react.ts         # Integración con React
│   ├── index.ts         # Exports públicos
│   └── types/
│       └── index.ts     # Tipos TypeScript
├── dist/                # Archivos compilados (generados)
│   ├── *.js            # JavaScript compilado
│   └── *.d.ts          # Declaraciones de tipos
├── package.json
└── tsconfig.json
```

## 🔧 Configuración TypeScript

El paquete usa:
- `module: "Node16"` para soporte ESM completo
- `declaration: true` para generar archivos `.d.ts`
- Imports con extensión `.js` para compatibilidad ESM

## 📝 Notas Importantes

1. **Siempre compila antes de probar**: Los cambios en `src/` no se reflejan hasta que ejecutes `npm run build`
2. **Archivos dist/ en .gitignore**: Los archivos compilados no se suben a git, se generan en cada instalación
3. **Extensiones .js en imports**: Aunque el código fuente es TypeScript, los imports deben usar `.js` para compatibilidad con Node16/ESM
