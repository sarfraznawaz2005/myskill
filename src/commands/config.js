import chalk from "chalk";
import { getConfig, setConfig } from "../utils/config.js";

export async function config(action, key, value) {
  if (action === "list") {
    const cfg = await getConfig();
    console.log(JSON.stringify(cfg, null, 2));
    return;
  }

  if (action === "get") {
    if (!key) {
      console.error(chalk.red("Error: Key required for get"));
      process.exit(1);
    }
    const cfg = await getConfig();
    // Simple deep get support
    const keys = key.split(".");
    let val = cfg;
    for (const k of keys) {
      val = val ? val[k] : undefined;
    }
    console.log(val !== undefined ? val : chalk.gray("undefined"));
    return;
  }

  if (action === "set") {
    if (!key || !value) {
      console.error(chalk.red("Error: Key and Value required for set"));
      process.exit(1);
    }
    await setConfig(key, value);
    console.log(chalk.green(`Set ${key} = ${value}`));
    return;
  }

  console.error(chalk.red(`Unknown action: ${action}`));
}
