import { Command } from "commander";
import chalk from "chalk";
import { spawn } from "child_process";
import { loadConfig } from "../core/config";

export function registerServe(app: Command, root: Command) {
  app
    .command("serve")
    .description("Serve microfrontend app")
    .action(async () => {
      await runDevServer();
    });

  root
    .command("serve")
    .description("Serve root shell")
    .action(async () => {
      await runDevServer();
    });

  app
    .command("preview")
    .description("Preview microfrontend app")
    .action(async () => {
      await runPreview();
    });

  root
    .command("preview")
    .description("Preview root shell")
    .action(async () => {
      await runPreview();
    });
}

async function runDevServer() {
  console.log(chalk.blue("🚀 Starting development server..."));
  const vite = spawn("npx", ["vite"], {
    stdio: "inherit",
    shell: true,
  });

  vite.on("error", (err) => {
    console.error(chalk.red(`Failed to start Vite: ${err.message}`));
  });
}

async function runPreview() {
  console.log(chalk.blue("🚀 Starting preview server..."));
  const vite = spawn("npx", ["vite", "preview"], {
    stdio: "inherit",
    shell: true,
  });

  vite.on("error", (err) => {
    console.error(chalk.red(`Failed to start Vite preview: ${err.message}`));
  });
}
