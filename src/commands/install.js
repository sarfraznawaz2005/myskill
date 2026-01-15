import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { platforms, getPlatformPath } from "../platforms/index.js";
import { promptWithCancellation } from "../utils/prompt.js";
import { findSkills } from "../utils/skills.js";

async function installToPlatform(sourcePath, platform, options = {}) {
  const skillName = path.basename(sourcePath);
  const globalPath = await getPlatformPath(platform.id);
  const targetDir = path.join(globalPath, skillName);

  if (await fs.pathExists(targetDir)) {
    if (options.force) {
      // Continue
    } else if (options.nonInteractive) {
      console.error(
        chalk.red(
          `Error: Skill already exists at ${targetDir}. Use --force to overwrite.`,
        ),
      );
      process.exit(1);
    } else {
      const { overwrite } = await promptWithCancellation([
        {
          type: "confirm",
          name: "overwrite",
          message: `Skill '${skillName}' already exists in ${platform.name} global directory. Overwrite?`,
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(
          chalk.red("Installation aborted for platform:", platform.name),
        );
        return;
      }
    }
  }

  try {
    await fs.ensureDir(globalPath);
    await fs.copy(sourcePath, targetDir, {
      filter: (src) => {
        const basename = path.basename(src);
        return basename !== "node_modules" && basename !== ".git";
      },
    });
    console.log(
      chalk.green(
        `Successfully installed '${skillName}' to ${targetDir} (${platform.name})`,
      ),
    );
  } catch (e) {
    console.error(
      chalk.red(`Installation failed for ${platform.name}: ${e.message}`),
    );
    // Don't exit, continue to next platform
  }
}

export async function install(pathStr, options = {}) {
  let sourcePath = pathStr;

  if (!sourcePath) {
    if (options.nonInteractive) {
      console.error(
        chalk.red("Error: Path is required in non-interactive mode"),
      );
      process.exit(1);
    }

    const skills = await findSkills(".");
    const validSkills = skills.filter((s) => !s.error);

    if (validSkills.length === 0) {
      console.error(
        chalk.red("Error: No valid skills detected in current directory"),
      );
      process.exit(1);
      return;
    }

    if (validSkills.length === 1) {
      sourcePath = validSkills[0].path;
      console.log(chalk.blue(`Detected skill: ${validSkills[0].name}`));
    } else {
      const { selectedSkillPath } = await promptWithCancellation([
        {
          type: "list",
          name: "selectedSkillPath",
          message: "Select a skill to install:",
          choices: validSkills.map((s) => ({
            name: `${s.name} (${s.platform.name})`,
            value: s.path,
          })),
        },
      ]);
      sourcePath = selectedSkillPath;
    }
  }

  const resolvedSource = path.resolve(sourcePath);
  if (!(await fs.pathExists(resolvedSource))) {
    console.error(
      chalk.red(`Error: Source path ${resolvedSource} does not exist`),
    );
    process.exit(1);
    return;
  }

  let selectedPlatforms = [];
  if (options.platform) {
    const platform = platforms[options.platform];
    if (!platform) {
      console.error(chalk.red(`Error: Unknown platform '${options.platform}'`));
      process.exit(1);
    }
    selectedPlatforms = [platform];
  } else {
    let detectedPlatformId = null;
    const skillMdPath = path.join(resolvedSource, "SKILL.md");
    if (await fs.pathExists(skillMdPath)) {
      const skills = await findSkills(path.dirname(resolvedSource));
      const currentSkill = skills.find((s) => s.path === resolvedSource);
      if (currentSkill) {
        detectedPlatformId = currentSkill.platform.id;
      }
    }

    const answers = await promptWithCancellation([
      {
        type: "list",
        name: "platform",
        message: "Select target platform to install to:",
        default: detectedPlatformId,
        choices: [
          ...Object.values(platforms).map((p) => ({
            name: p.name,
            value: p.id,
          })),
          { name: "ALL platforms", value: "all" },
        ],
      },
    ]);
    if (answers.platform === "all") {
      selectedPlatforms = Object.values(platforms);
    } else {
      selectedPlatforms = [platforms[answers.platform]];
    }
  }

  for (const platform of selectedPlatforms) {
    await installToPlatform(resolvedSource, platform, options);
  }
}
