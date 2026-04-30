import fs from "fs-extra";
import path from "path";

export interface VydraConfig {
  "vydra-cli": string;
  version: string;
  project: {
    name: string;
    prefix: string;
    type: "app" | "root";
    schematics: {
      page: {
        styles: boolean;
        test: boolean;
      };
      component: {
        styles: boolean;
        test: boolean;
      };
    };
  };
  cli: Record<string, unknown>;
}

export async function loadConfig(cwd: string = process.cwd()): Promise<VydraConfig> {
  const file = path.resolve(cwd, "vydra.json");

  if (!(await fs.pathExists(file))) {
    throw new Error("No vydra.json found. Make sure you are in a Vydra project.");
  }

  return fs.readJSON(file);
}

export async function saveConfig(config: VydraConfig, cwd: string = process.cwd()) {
  const file = path.resolve(cwd, "vydra.json");
  await fs.writeJSON(file, config, { spaces: 2 });
}

export function getDefaultConfig(name: string, prefix: string, type: "app" | "root"): VydraConfig {
  return {
    "vydra-cli": "0.0.1",
    version: "0.0.1",
    project: {
      name,
      prefix,
      type,
      schematics: {
        page: {
          styles: true,
          test: true,
        },
        component: {
          styles: true,
          test: true,
        },
      },
    },
    cli: {},
  };
}
