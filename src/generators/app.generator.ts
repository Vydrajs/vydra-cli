import fs from "fs-extra";
import path from "path";
import { VydraConfig } from "../core/config.js";

export async function generateAppScaffold(
  targetDir: string,
  config: VydraConfig,
) {
  const name = config.project.name;
  const prefix = config.project.prefix;

  // 1. package.json
  const pkg = {
    name: name,
    version: "0.0.1",
    type: "module",
    scripts: {
      tsc: "tsc",
      dev: "vite --mode development",
      "build:spa": "vite build --mode spa",
      "build:mfe": "vite build --mode mfe",
      build: "vite build --mode production",
      preview: "vite preview --mode mfe",
    },
    dependencies: {
      "@lit/context": "^1.1.6",
      "@open-wc/scoped-elements": "^3.0.6",
      "@vydra-js/bus": "^0.0.1",
      "@vydra-js/core": "^0.0.1",
      "@vydra-js/forms": "^0.0.1",
      "@vydra-js/i18n": "^0.0.1",
      "@vydra-js/router": "^0.0.1",
      "@webcomponents/scoped-custom-element-registry": "^0.0.10",
      lit: "^3.2.1",
    },
    devDependencies: {
      "@open-wc/testing": "^4.0.0",
      "@types/mocha": "^10.0.10",
      jsdom: "^27.0.1",
      vitest: "^3.2.4",
      typescript: "^5.6.2",
      vite: "^5.4.9",
    },
  };
  await fs.writeJSON(path.join(targetDir, "package.json"), pkg, { spaces: 2 });

  // 2. tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      useDefineForClassFields: false,
      module: "ESNext",
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
    include: ["src"],
  };
  await fs.writeJSON(path.join(targetDir, "tsconfig.json"), tsconfig, {
    spaces: 2,
  });

  // 3. vite.config.js
  const viteConfig = `import { defineConfig, loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const isMfe = mode === "mfe";

  return {
    base: isMfe ? env.VITE_BASE_PATH || "/" : "/",
    build: {
      target: "esnext",
      ...(isMfe
        ? {
            outDir: "dist-mfe",
            lib: {
              entry: path.resolve(__dirname, "src/bootstrap.ts"),
              formats: ["es"],
              fileName: () => "index.js",
            },
          }
        : {
            outDir: "dist-spa",
            rollupOptions: {
              input: path.resolve(__dirname, "index.html"),
            },
          }),
    },

    server: {
      port: Number(env.VITE_PORT) || 3002,
      cors: true,
    },

    preview: {
      port: Number(env.VITE_PORT) || 3002,
      cors: true,
    },
  };
});
`;
  await fs.writeFile(path.join(targetDir, "vite.config.js"), viteConfig);

  // 4. index.html
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} | Vydra App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
`;
  await fs.writeFile(path.join(targetDir, "index.html"), html);

  // 5. Directory structure
  const srcDir = path.join(targetDir, "src");
  const appDir = path.join(srcDir, "app");
  const publicDir = path.join(targetDir, "public");
  const localesDir = path.join(publicDir, "locales");

  await fs.ensureDir(path.join(appDir, "config"));
  await fs.ensureDir(path.join(appDir, "pages/home"));
  await fs.ensureDir(path.join(appDir, "router"));
  await fs.ensureDir(path.join(appDir, "services"));
  await fs.ensureDir(localesDir);

  // 5.1 locales files
  const enLocale = {
    title: "Vydra",
    framework: "Framework",
    subtitle: "Your new project is ready to go.",
    description:
      "A lightweight, reactive, and professional foundation for modern web apps.",
    cta: "Documentation",
    secondary: "Edit src/app/pages/home/home.page.ts to start.",
    langBtn: "Español",
  };

  const esLocale = {
    title: "Vydra",
    framework: "Framework",
    subtitle: "Tu nuevo proyecto está listo.",
    description:
      "Una base ligera, reactiva y profesional para aplicaciones web modernas.",
    cta: "Documentación",
    secondary: "Edita src/app/pages/home/home.page.ts para empezar.",
    langBtn: "English",
  };

  await fs.writeJSON(path.join(localesDir, "en.json"), enLocale, { spaces: 2 });
  await fs.writeJSON(path.join(localesDir, "es.json"), esLocale, { spaces: 2 });

  // 6. src/main.ts
  const mainTs = `import "@webcomponents/scoped-custom-element-registry";
import { VydraRouter } from "@vydra-js/router";
import { VydraOutlet } from "./app/app.component";
import { routes } from "./app/router/app.router";
import { RootService } from "./app/services/root.bus";
import { Inject } from "@vydra-js/core";
import { i18n } from "@vydra-js/i18n";

const rootService = Inject(RootService);
rootService.setConfig({ lang: "en" });
await i18n.load("en");

const mountPoint = document.getElementById("app")!;

if (!customElements.get(VydraOutlet.is)) {
  customElements.define(VydraOutlet.is, VydraOutlet);
}

const outlet = document.createElement(VydraOutlet.is) as any;
mountPoint.appendChild(outlet);

const router = new VydraRouter({
  basePath: "/",
  mountPoint,
  outlet,
  routes,
});
router.init();
`;
  await fs.writeFile(path.join(srcDir, "main.ts"), mainTs);

  // 7. src/bootstrap.ts
  const bootstrapTs = `import { createMicrofrontendLifecycle, Inject } from "@vydra-js/core";
import { VydraRouter } from "@vydra-js/router";
import { VydraOutlet } from "./app/app.component";
import { routes } from "./app/router/app.router";
import { VydraBus } from "@vydra-js/bus";
import { RootService } from "./app/services/root.bus";
import { appConfig } from "./app/config/app.config";
import { i18n } from "@vydra-js/i18n";

export const lifecycle = createMicrofrontendLifecycle({
  rootTag: VydraOutlet.is,
  rootComponent: VydraOutlet,
  onBootstrap: async () => {},
  onMount: async ({ mountPoint, rootConfig }, outlet) => {
    i18n.setBasePath(appConfig.localesPath);
    const rootService = Inject(RootService);
    rootService.setConfig(rootConfig);
    await i18n.load((rootConfig?.lang as string) || "en");
    mountPoint.appendChild(outlet);
    const router = new VydraRouter({
      basePath: appConfig.basePath,
      mountPoint,
      outlet,
      routes,
      onRedirectMicrofrontend: (nav) => {
        new VydraBus("global").emit("mf:switch-request", nav);
      },
    });
    await router.init();
    return () => router.destroy();
  },
});
`;
  await fs.writeFile(path.join(srcDir, "bootstrap.ts"), bootstrapTs);

  // 8. src/app/app.component.ts
  const appComponentTs = `import { html, TemplateResult } from "lit";
import { Inject, VydraOutletBase } from "@vydra-js/core";
import { i18n, I18nAdapter, i18nContext } from "@vydra-js/i18n";
import { provide } from "@lit/context";
import { RootService } from "./services/root.bus";

export class VydraOutlet extends VydraOutletBase {
  static is = "${prefix}-${name}-outlet";
  i18nAdapter = new I18nAdapter();
  rootBus = Inject(RootService);
  
  @provide({ context: i18nContext })
  i18n = this.i18nAdapter;

  constructor() {
    super();
    this.rootBus.onSetLangRequested((lang) => {
      this.setLanguage(lang);
    });
  }

  async setLanguage(lang: string) {
    await i18n.load(lang);
    i18n.setLanguage(lang);
  }

  protected override render(): TemplateResult | string {
    if (!this.pageTag) return "";

    if (this.pageTag === "__not_found__") return this.renderNotFound();
    if (this.pageTag === "__forbidden__") return this.renderForbidden();

    return html\`\${this.renderPage()}\`\;
  }

  protected renderNotFound(): TemplateResult {
    return html\` <div
      style="display:flex;flex-direction:column;align-items:center;padding:4rem;font-family:sans-serif"
    >
      <h1 style="font-size:5rem;margin:0;color:#e5e7eb">404</h1>
      <p style="color:#6b7280">Page not found</p>
    </div>\`;
  }

  protected renderForbidden(): TemplateResult {
    return html\` <div
      style="display:flex;flex-direction:column;align-items:center;padding:4rem;font-family:sans-serif"
    >
      <h1 style="font-size:5rem;margin:0;color:#e5e7eb">403</h1>
      <p style="color:#6b7280">Access denied</p>
    </div>\`;
  }
}
`;
  await fs.writeFile(path.join(appDir, "app.component.ts"), appComponentTs);

  // 9. src/app/config/app.config.ts
  const appConfigTs = `/**
 * Expose here the .env config that you want be in the app in runtime
 */

/**
 * .env file config
 */
const config = (import.meta as any).env;

export const appConfig = {
  basePath: config.VITE_BASE_PATH as string,
  localesPath: config.VITE_LOCALES_PATH as string,
};
`;
  await fs.writeFile(path.join(appDir, "config/app.config.ts"), appConfigTs);

  // 10. src/app/services/root.bus.ts
  const rootBusTs = `import { VydraBus } from "@vydra-js/bus";
import { Injectable } from "@vydra-js/core";

@Injectable()
export class RootService {
  private bus = new VydraBus("global");
  private _config: any = {};
  
  onSetLangRequested(callback: (lang: string) => void) {
    return this.bus.on("lang-requested", callback);
  }

  setLang(lang: string) {
    this.bus.emit("lang-requested", lang);
  }

  setConfig(config: any) {
    this._config = config;
  }

  getConfig() {
    return this._config;
  }
}
`;
  await fs.writeFile(path.join(appDir, "services/root.bus.ts"), rootBusTs);

  // 11. src/app/router/app.router.ts
  const routerTs = `import { VydraRoute } from "@vydra-js/router";

export const routes: VydraRoute[] = [
  {
    path: "/",
    title: "Home | Vydra",
    componentTag: "home-page",
    componentLoader: async () => {
      return (await import("../pages/home/home.page")).HomePage as any;
    },
  },
];
`;
  await fs.writeFile(path.join(appDir, "router/app.router.ts"), routerTs);

  // 12. src/app/pages/home/home.page.ts
  const homePageTs = `import { html, LitElement } from "lit";
import { ScopedElementsMixin } from "@open-wc/scoped-elements/lit-element.js";
import { I18nMixin } from "@vydra-js/i18n";
import { homePageStyle } from "./home.page.css";
import { RootService } from "../../services/root.bus";
import { i18n } from "@vydra-js/i18n";

export class HomePage extends I18nMixin(ScopedElementsMixin(LitElement)) {
  static styles = homePageStyle;
  private rootService = new RootService();
  
  private _toggleLang() {
    const currentLang = i18n.getCurrentLang();
    this.rootService.setLang(currentLang === "en" ? "es" : "en");
  }

  render() {
    return html\`
      <div class="header">
        <button class="lang-toggle" @click=\${this._toggleLang}>
          \${this.t("langBtn")}
        </button>
      </div>

      <div class="container">
        <div class="hero">
          <span class="badge">v0.0.1 Alpha</span>
          <h1>
            \${this.t("title")} <span class="gradient-text">JS</span> \${this.t(
              "framework",
            )}
          </h1>
          <p class="subtitle">
            \${this.t("subtitle")}<br />\${this.t("description")}
          </p>

          <div class="actions">
            <a href="#" class="btn btn-primary">\${this.t("cta")}</a>
          </div>

          <div class="footer-note">\${this.t("secondary")}</div>
        </div>
      </div>
    \`;
  }
}
`;
  await fs.writeFile(path.join(appDir, "pages/home/home.page.ts"), homePageTs);

  // 13. src/app/pages/home/home.page.css.ts
  const homePageCssTs = `import { css } from "lit";

export const homePageStyle = css\`
  :host {
    --v-primary: #6366f1;
    --v-primary-dark: #4f46e5;
    --v-bg: #ffffff;
    --v-text-main: #111827;
    --v-text-muted: #6b7280;
    --v-surface: #f9fafb;
    --v-border: #e5e7eb;

    display: block;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    background-color: var(--v-bg);
    color: var(--v-text-main);
    min-height: 100vh;
    margin: 0;
  }

  .header {
    display: flex;
    justify-content: flex-end;
    padding: 1.5rem 2rem;
  }

  .lang-toggle {
    background: none;
    border: 1px solid var(--v-border);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .lang-toggle:hover {
    background: var(--v-surface);
    border-color: var(--v-text-muted);
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 4rem 2rem;
    text-align: center;
  }

  .hero {
    animation: slideUp 0.6s ease-out;
  }

  .badge {
    display: inline-block;
    background: #eef2ff;
    color: var(--v-primary);
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: clamp(2.5rem, 8vw, 4rem);
    font-weight: 800;
    line-height: 1.1;
    margin: 0 0 1.5rem 0;
    letter-spacing: -0.02em;
  }

  .gradient-text {
    background: linear-gradient(135deg, var(--v-primary), #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    font-size: 1.25rem;
    color: var(--v-text-muted);
    margin-bottom: 2.5rem;
    line-height: 1.6;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 4rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    text-decoration: none;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .btn-primary {
    background-color: var(--v-primary);
    color: white;
    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
  }

  .btn-primary:hover {
    background-color: var(--v-primary-dark);
    transform: translateY(-2px);
  }

  .footer-note {
    font-family: "ui-monospace", monospace;
    background: var(--v-surface);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--v-border);
    color: var(--v-text-muted);
    font-size: 0.9rem;
    display: inline-block;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 600px) {
    .actions {
      flex-direction: column;
    }
  }
\`;
`;
  await fs.writeFile(
    path.join(appDir, "pages/home/home.page.css.ts"),
    homePageCssTs,
  );

  // 14. gitignore
  const gitignore = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-spa
dist-mfe
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;
  await fs.writeFile(path.join(targetDir, ".gitignore"), gitignore);

  // 15. .env files
  const mfeEnv = `VITE_BASE_PATH=/${name.toLowerCase()}
VITE_LOCALES_PATH=http://localhost:3003/${name.toLowerCase()}`;
  await fs.writeFile(path.join(targetDir, ".env.mfe"), mfeEnv);

  const developmentEnv = `VITE_BASE_PATH=
VITE_LOCALES_PATH=`;
  await fs.writeFile(path.join(targetDir, ".env.development"), developmentEnv);

  // 16. vitest.config.ts
  const vitest = `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
    watch: false,
  },
});
`;
  await fs.writeFile(path.join(targetDir, "vitest.config.ts"), vitest);
}
