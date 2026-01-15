import chalk from "chalk";
import { platforms } from "../platforms/index.js";

export async function platformsCommand(options = {}) {
  console.log(chalk.blue("Available Platforms:\n"));

  for (const [id, platform] of Object.entries(platforms)) {
    console.log(`${chalk.bold(id)}: ${platform.name}`);
  }
}
