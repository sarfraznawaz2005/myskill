import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { findSkills } from "../utils/skills.js";
import { platforms } from "../platforms/index.js";

export async function detect(pathStr = ".", options = {}) {
  const targetDir = pathStr === "." ? process.cwd() : path.resolve(pathStr);

  console.log(chalk.blue(`Detecting skills in: ${targetDir}\n`));

  try {
    let allSkills = await findSkills(targetDir);

    for (const platform of Object.values(platforms)) {
      const localBase =
        platform.id === "opencode"
          ? ".opencode/skill"
          : `.${platform.id}/skills`;
      const platformDir = path.join(targetDir, localBase);

      if (await fs.pathExists(platformDir)) {
        const platformSkills = await findSkills(platformDir);
        for (const skill of platformSkills) {
          if (!allSkills.some((s) => s.path === skill.path)) {
            allSkills.push(skill);
          }
        }
      }
    }

    if (allSkills.length === 0) {
      console.log(chalk.yellow("No skills detected in current directory."));
      return;
    }

    for (const skill of allSkills) {
      if (skill.error) {
        console.log(`${chalk.bold(skill.name)}: ${chalk.red(skill.error)}`);
        continue;
      }
      console.log(
        `${chalk.bold(skill.name)}: ${chalk.green(skill.platform.name)} (${skill.platform.id})`,
      );
      console.log(`  Description: ${skill.description}`);
      console.log(`  Path: ${path.relative(targetDir, skill.path)}`);
    }
  } catch (e) {
    console.error(chalk.red(`Error scanning directory: ${e.message}`));
  }
}
