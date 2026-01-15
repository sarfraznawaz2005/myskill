import { claude } from "./claude.js";
import { opencode } from "./opencode.js";
import { codex } from "./codex.js";
import { gemini } from "./gemini.js";
import { getConfig } from "../utils/config.js";

export const platforms = {
  claude,
  opencode,
  codex,
  gemini,
};

export function getPlatform(id) {
  return platforms[id];
}

export async function getPlatformPath(id) {
  const platform = platforms[id];
  if (!platform) return null;

  const config = await getConfig();
  if (config[id] && config[id].path) {
    return config[id].path;
  }
  return platform.defaultPath;
}
