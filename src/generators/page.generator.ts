import fs from "fs-extra";
import path from "path";
import { resolveNames } from "../core/naming.js";
import { compileTemplate } from "../core/template.js";
import { VydraConfig } from "../core/config.js";

const PAGE_TEMPLATE = `import { html, LitElement } from "lit";
import { ScopedElementsMixin } from "@open-wc/scoped-elements/lit-element.js";
import { I18nMixin } from "@vydra-js/i18n";
<% if (hasStyles) { %>import { <%= variableName %>PageStyle } from "./<%= fileName %>.page.css";<% } %>

export class <%= className %>Page extends I18nMixin(ScopedElementsMixin(LitElement)) {
  static is = "<%= selector %>-page";
  <% if (hasStyles) { %>static styles = <%= variableName %>PageStyle;<% } %>

  render() {
    return html\`
      <h1><%= className %> Page</h1>
      <p>Welcome to your new page!</p>
    \`;
  }
}
`;

const TEST_TEMPLATE = `import { fixture, html, expect } from "@open-wc/testing";
import "./<%= fileName %>.page";
import { <%= className %>Page } from "./<%= fileName %>.page";

describe("<%= className %>Page", () => {
  let el: <%= className %>Page;

  beforeEach(async () => {
    el = await fixture(html\`<<%= selector %>-page></<%= selector %>-page>\`);
    await el.updateComplete;
  });

  it("should render correctly", async () => {
    const h1 = el.shadowRoot!.querySelector("h1");
    expect(h1!.textContent).to.equal("<%= className %> Page");
  });
});
`;

export async function generatePage(name: string, config: VydraConfig) {
  const names = resolveNames(name, config.project.prefix);
  const targetDir = path.resolve(
    process.cwd(),
    "src/app/pages",
    names.fileName,
  );

  await fs.ensureDir(targetDir);

  const hasStyles = config.project.schematics.page.styles;

  const vars = {
    ...names,
    className: names.className,
    hasStyles,
  };

  // Generate .page.css.ts if enabled
  if (hasStyles) {
    const cssContent = `import { css } from "lit";\n\nexport const ${names.variableName}PageStyle = css\`\n  :host {\n    display: block;\n  }\n\`;\n`;
    await fs.writeFile(
      path.join(targetDir, `${names.fileName}.page.css.ts`),
      cssContent,
    );
  }

  // Generate .page.ts
  await fs.writeFile(
    path.join(targetDir, `${names.fileName}.page.ts`),
    compileTemplate(PAGE_TEMPLATE, vars),
  );

  // Generate .page.test.ts if enabled
  if (config.project.schematics.page.test) {
    await fs.writeFile(
      path.join(targetDir, `${names.fileName}.page.test.ts`),
      compileTemplate(TEST_TEMPLATE, vars),
    );
  }

  // Update router
  await updateRouter(names);
}

async function updateRouter(names: ReturnType<typeof resolveNames>) {
  const routerPath = path.resolve(
    process.cwd(),
    "src/app/router/app.router.ts",
  );

  if (!(await fs.pathExists(routerPath))) {
    return;
  }

  let content = await fs.readFile(routerPath, "utf-8");

  const newRoute = `  {
    path: "/${names.fileName}",
    title: "${names.className} | Vydra",
    componentTag: "${names.selector}-page",
    componentLoader: async () => {
      return (await import("../pages/${names.fileName}/${names.fileName}.page")).${names.className}Page as any;
    },
  },
];`;

  content = content.replace(/\];\s*$/, newRoute);
  await fs.writeFile(routerPath, content);
}

