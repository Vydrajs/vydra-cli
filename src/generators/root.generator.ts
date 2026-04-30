import fs from "fs-extra";
import path from "path";
import { VydraConfig } from "../core/config.js";

export async function generateRootScaffold(
  targetDir: string,
  config: VydraConfig,
) {
  const name = config.project.name;
  const prefix = config.project.prefix;

  // 1. package.json
  const pkg = {
    name: `${prefix ? `@${prefix}/` : ""}${name}-app`,
    version: "0.0.1",
    type: "module",
    scripts: {
      dev: "vite --port=9000",
      build: "tsc && vite build",
      preview: "vite preview",
    },
    dependencies: {
      lit: "^3.2.1",
      "@vydra-js/core": "^0.0.1",
      "@vydra-js/router": "^0.0.1",
      "@vydra-js/bus": "^0.0.1",
      "@vydra-js/i18n": "^0.0.1",
      "@vydra-js/forms": "^0.0.1",
      "@open-wc/scoped-elements": "^3.0.6",
      "@webcomponents/scoped-custom-element-registry": "^0.0.10",
    },
    devDependencies: {
      vite: "^5.4.9",
      typescript: "^5.6.2",
    },
  };
  await fs.writeJSON(path.join(targetDir, "package.json"), pkg, { spaces: 2 });

  // 2. vite.config.js
  const viteConfig = `import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4000,
  },
});
`;
  await fs.writeFile(path.join(targetDir, "vite.config.js"), viteConfig);

  // 3. index.html
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} | Vydra Root Shell</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
`;
  await fs.writeFile(path.join(targetDir, "index.html"), html);

  // 4. src/main.ts
  await fs.ensureDir(path.join(targetDir, "src"));
  const mainTs = `import "@webcomponents/scoped-custom-element-registry";
import { createRootApp } from "@vydra-js/core";

const root = createRootApp({
  mountPoint: document.getElementById("app")!,
  config: { apiUrl: "https://api.example.com" },
  registry: [
    // Register your MFs here
    /*
    {
      name: "@app/dashboard",
      basePath: "/dashboard",
      loader: () => import("http://localhost:3000/index.js")
    }
    */
  ],
});

root.navigate(window.location.pathname);
`;
  await fs.writeFile(path.join(targetDir, "src/main.ts"), mainTs);
}
