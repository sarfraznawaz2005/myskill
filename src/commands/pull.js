import simpleGit from "simple-git";
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { platforms, getPlatform, getPlatformPath } from "../platforms/index.js";
import { promptWithCancellation } from "../utils/prompt.js";

export async function pull(repoUrl, options = {}) {
  // Logic:
  // 1. Identify target platform.
  // 2. Identify target name (from repo name or option).
  // 3. Clone or Pull.

  if (!repoUrl) {
    console.error(chalk.red("Error: Repository URL is required."));
    process.exit(1);
  }

  let platformName = options.platform;
  if (!platformName) {
    // Try interactive
    if (!options.nonInteractive) {
      const answer = await promptWithCancellation([
        {
          type: "list",
          name: "platform",
          message: "Target platform for this skill:",
          choices: Object.values(platforms).map((p) => ({
            name: p.name,
            value: p.id,
          })),
        },
      ]);
      platformName = answer.platform;
    } else {
      console.error(chalk.red("Error: Platform is required (--platform)."));
      process.exit(1);
    }
  }

  const platform = getPlatform(platformName);
  if (!platform) {
    console.error(chalk.red(`Error: Unknown platform '${platformName}'`));
    process.exit(1);
  }

  // Determine skill name from repo URL if not provided
  let skillName = options.name;
  if (!skillName) {
    const basename = path.basename(repoUrl, ".git");
    skillName = basename;
  }

  // Target directory
  const platformPath = await getPlatformPath(platformName);
  const targetDir = path.join(platformPath, skillName);

  const git = simpleGit();

  // Check if git is installed
  try {
    await git.raw(["--version"]);
  } catch (e) {
    throw new Error(
      "Git is not installed or not in PATH. Please install git to use this command.",
    );
  }

  if (await fs.pathExists(targetDir)) {
    // Exists, try to pull
    console.log(
      chalk.blue(`Skill '${skillName}' exists. Pulling latest changes...`),
    );
    try {
      await git.cwd(targetDir).pull();
      console.log(chalk.green("Successfully updated skill."));
    } catch (e) {
      console.error(chalk.red(`Error pulling changes: ${e.message}`));
      process.exit(1);
    }
  } else {
    // Clone
    console.log(chalk.blue(`Cloning '${skillName}' to ${targetDir}...`));
    try {
      await fs.ensureDir(platformPath);
      await git.clone(repoUrl, targetDir);
      console.log(chalk.green("Successfully cloned skill."));
    } catch (e) {
      console.error(chalk.red(`Error cloning repo: ${e.message}`));
      process.exit(1);
    }
  }
}
