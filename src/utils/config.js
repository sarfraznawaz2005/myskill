import fs from "fs-extra";
import path from "path";
import os from "os";

const CONFIG_PATH = path.join(
  os.homedir(),
  ".config",
  "myskill",
  "config.json",
);

export async function getConfig() {
  if (await fs.pathExists(CONFIG_PATH)) {
    try {
      return await fs.readJson(CONFIG_PATH);
    } catch (e) {
      return {};
    }
  }
  return {};
}

export async function setConfig(key, value) {
  const config = await getConfig();

  // Handle nested keys like "claude.path"
  const keys = key.split(".");
  let current = config;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!current[k]) current[k] = {};
    current = current[k];
  }

  current[keys[keys.length - 1]] = value;

  await fs.ensureDir(path.dirname(CONFIG_PATH));
  await fs.writeJson(CONFIG_PATH, config, { spaces: 2 });
  return config;
}
