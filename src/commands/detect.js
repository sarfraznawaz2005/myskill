import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { findSkills } from "../utils/skills.js";

export async function detect(pathStr = ".", options = {}) {
  const targetDir = pathStr === "." ? process.cwd() : path.resolve(pathStr);

  console.log(chalk.blue(`Detecting skills in: ${targetDir}\n`));

  try {
    const skills = await findSkills(targetDir);

    if (skills.length === 0) {
      console.log(chalk.yellow("No skills detected in current directory."));
      return;
    }

    for (const skill of skills) {
      if (skill.error) {
        console.log(`${chalk.bold(skill.name)}: ${chalk.red(skill.error)}`);
        continue;
      }
      console.log(
        `${chalk.bold(skill.name)}: ${chalk.green(skill.platform.name)} (${skill.platform.id})`,
      );
      console.log(`  Description: ${skill.description}`);
    }
  } catch (e) {
    console.error(chalk.red(`Error scanning directory: ${e.message}`));
  }
}
