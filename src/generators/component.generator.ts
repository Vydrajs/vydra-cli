import fs from "fs-extra";
import path from "path";
import { resolveNames } from "../core/naming.js";
import { compileTemplate } from "../core/template.js";
import { VydraConfig } from "../core/config.js";

const COMPONENT_TEMPLATE = `import { html, LitElement } from "lit";
import { ScopedElementsMixin } from "@open-wc/scoped-elements/lit-element.js";
<% if (hasStyles) { %>import { <%= variableName %>Style } from "./<%= fileName %>.css";<% } %>

export class <%= className %> extends ScopedElementsMixin(LitElement) {
  static is = "<%= selector %>";
  <% if (hasStyles) { %>static styles = <%= variableName %>Style;<% } %>

  render() {
    return html\`
      <div><%= className %> Component</div>
    \`;
  }
}
`;

export async function generateComponent(name: string, config: VydraConfig) {
  const names = resolveNames(name, config.project.prefix);
  const targetDir = path.resolve(
    process.cwd(),
    "src/app/components",
    names.fileName,
  );

  await fs.ensureDir(targetDir);

  const hasStyles = config.project.schematics.component.styles;

  const vars = {
    ...names,
    hasStyles,
  };

  // Generate .css.ts if enabled
  if (hasStyles) {
    const cssContent = `import { css } from "lit";\n\nexport const ${names.variableName}Style = css\`\n  :host {\n    display: block;\n  }\n\`;\n`;
    await fs.writeFile(
      path.join(targetDir, `${names.fileName}.css.ts`),
      cssContent,
    );
  }

  // Generate .ts
  await fs.writeFile(
    path.join(targetDir, `${names.fileName}.ts`),
    compileTemplate(COMPONENT_TEMPLATE, vars),
  );

  // Generate .test.ts if enabled
  if (config.project.schematics.component.test) {
    const testContent = `import { fixture, html, expect } from "@open-wc/testing";\nimport "./${names.fileName}";\n\ndescribe("${names.className}", () => {\n  it("should be defined", () => {\n    const el = document.createElement("${names.selector}");\n    expect(el).to.be.instanceOf(HTMLElement);\n  });\n});\n`;
    await fs.writeFile(
      path.join(targetDir, `${names.fileName}.test.ts`),
      testContent,
    );
  }
}
