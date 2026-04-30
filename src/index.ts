#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";

import { registerNew } from "./commands/new.js";
import { registerGenerate } from "./commands/generate.js";
import { registerServe } from "./commands/serve.js";
import { registerBuild } from "./commands/build.js";

const program = new Command();
const description = `
${chalk.blueBright("        ==-=======             ")}${chalk.hex("#30b3ad")("                                                 ")}
${chalk.blueBright("     ================          ")}${chalk.hex("#30b3ad")("                                                 ")}
${chalk.blueBright("   ====            =====       ")}${chalk.hex("#30b3ad")("           ==                                    ")}
${chalk.blueBright("  ===       -     === =====    ")}${chalk.hex("#30b3ad")("####     ===                 ##                  ")}
${chalk.blueBright(" ================ ==    ===    ")}${chalk.hex("#30b3ad")(" ###    ===                  ##                  ")}
${chalk.blueBright("-==== ============     -===    ")}${chalk.hex("#30b3ad")(" ####  ==== ###   ### #########  ##*### #######  ")}
${chalk.blueBright("====  ============ ======      ")}${chalk.hex("#30b3ad")("  +###====  ###* ###  ###   ###  ###     #  *### ")}
${chalk.blueBright("-==    ===============         ")}${chalk.hex("#30b3ad")("   ###===    #######  ###   *##  ###   ######### ")}
${chalk.blueBright(" ==     ===========            ")}${chalk.hex("#30b3ad")("     ===      #####   #########  ###   ######### ")}
${chalk.blueBright("  =:          ====             ")}${chalk.hex("#30b3ad")("    -==        ###      #### ##  ###     ####### ")}
${chalk.blueBright("   ==         ====             ")}${chalk.hex("#30b3ad")("   ==       #####                                ")}
${chalk.blueBright("             ======            ")}${chalk.hex("#30b3ad")("                                                 ")}
${chalk.blueBright("             ====              ")}${chalk.hex("#30b3ad")("                                                 ")}

Vydra CLI (Alpha) (v0.0.1)
Build Fast SPA & Microfrontend Applications based on Web Components

Packages:                 Version:
-------------------------------------------------
- @vydra-js/bus           0.0.1@alpha
- @vydra-js/core          0.0.1@alpha
- @vydra-js/forms         0.0.1@alpha
- @vydra-js/http          0.0.1@alpha
- @vydra-js/i18n          0.0.1@alpha
- @vydra-js/router        0.0.1@alpha
- @vydra-js/shared        0.0.1@alpha
`;
program.name("vydra").description(description).version("0.0.1");

const app = program.command("app").description("Microfrontend app commands");
const root = program.command("root").description("Root shell commands");

registerNew(program);
registerGenerate(program);
registerServe(app, root);
registerBuild(app, root);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
