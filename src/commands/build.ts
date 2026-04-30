import { Command } from "commander";
import chalk from "chalk";
import { spawn } from "child_process";

export function registerBuild(app: Command, root: Command) {
  app
    .command("build")
    .description("Build microfrontend app")
    .option("-m, --mode <mode>", "Build mode (spa or mfe)", "spa")
    .action(async (options) => {
      await runBuild(options.mode);
    });

  root
    .command("build")
    .description("Build root shell")
    .action(async () => {
      await runBuild("production");
    });
}

async function runBuild(mode: string) {
  console.log(chalk.blue(`📦 Building project in ${mode} mode...`));
  
  const args = ["vite", "build"];
  if (mode === "spa" || mode === "mfe") {
    args.push("--mode", mode);
  }

  const vite = spawn("npx", args, {
    stdio: "inherit",
    shell: true,
  });

  vite.on("error", (err) => {
    console.error(chalk.red(`Build failed: ${err.message}`));
  });

  vite.on("close", (code) => {
    if (code === 0) {
      console.log(chalk.green("✔ Build completed successfully."));
    } else {
      console.error(chalk.red(`Build exited with code ${code}`));
    }
  });
}
