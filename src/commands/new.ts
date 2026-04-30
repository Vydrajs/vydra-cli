import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { getDefaultConfig, saveConfig } from "../core/config.js";
import { generateAppScaffold } from "../generators/app.generator.js";
import { generateRootScaffold } from "../generators/root.generator.js";

export function registerNew(program: Command) {
  program
    .command("new <type> <name> [prefix]")
    .description("Create a new Vydra project (app or root)")
    .action(async (type, name, prefix) => {
      const projectPrefix = prefix || "vydra";

      if (type !== "app" && type !== "root") {
        console.error(chalk.red(`Invalid type: ${type}. Must be 'app' or 'root'.`));
        process.exit(1);
      }

      const targetDir = path.resolve(process.cwd(), name);

      if (await fs.pathExists(targetDir)) {
        const { overwrite } = await inquirer.prompt([
          {
            type: "confirm",
            name: "overwrite",
            message: `Directory ${name} already exists. Overwrite?`,
            default: false,
          },
        ]);

        if (!overwrite) {
          process.exit(0);
        }
        await fs.emptyDir(targetDir);
      } else {
        await fs.ensureDir(targetDir);
      }

      console.log(chalk.blue(`🚀 Scaffolding new ${type} project: ${name}...`));

      // 1. Create vydra.json
      const config = getDefaultConfig(name, projectPrefix, type);
      await saveConfig(config, targetDir);

      // 2. Generate project structure
      // In a real CLI, we would copy from a template directory
      // For this task, I'll implement a generator that writes the files
      if (type === "app") {
        await generateAppScaffold(targetDir, config);
      } else {
        await generateRootScaffold(targetDir, config);
      }

      console.log(chalk.green(`\n✔ Project ${name} created successfully!`));
      console.log(chalk.cyan(`\nNext steps:`));
      console.log(`  cd ${name}`);
      console.log(`  pnpm install`);
      console.log(`  vydra app serve`);
    });
}

