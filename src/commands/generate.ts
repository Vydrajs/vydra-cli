import { Command } from "commander";
import chalk from "chalk";
import { loadConfig } from "../core/config";
import { generatePage } from "../generators/page.generator";
import { generateComponent } from "../generators/component.generator";

export function registerGenerate(program: Command) {
  const generate = program
    .command("generate")
    .alias("g")
    .description("Generate entities (page, component)");

  generate
    .command("page <name>")
    .description("Generate a new page")
    .action(async (name) => {
      try {
        const config = await loadConfig();
        await generatePage(name, config);
        console.log(chalk.green(`✔ Page ${name} generated successfully.`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });

  generate
    .command("component <name>")
    .description("Generate a new component")
    .action(async (name) => {
      try {
        const config = await loadConfig();
        await generateComponent(name, config);
        console.log(chalk.green(`✔ Component ${name} generated successfully.`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });
}
