import chalk from "chalk";
import { platforms } from "../platforms/index.js";

export async function docs() {
  console.log(chalk.blue("=== Platform Documentation ===\n"));

  for (const platform of Object.values(platforms)) {
    console.log(`${chalk.bold(platform.name)}:`);
    console.log(`  ${chalk.cyan(platform.docsUrl)}`);
    console.log();
  }
}
