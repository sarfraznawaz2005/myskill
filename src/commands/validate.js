import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import yaml from "js-yaml";
import { platforms } from "../platforms/index.js";

export async function validate(targetPath, options = {}) {
  const resolvedPath = path.resolve(targetPath);
  const skillMdPath = path.join(resolvedPath, "SKILL.md");

  if (!(await fs.pathExists(skillMdPath))) {
    console.error(chalk.red(`Error: SKILL.md not found in ${resolvedPath}`));
    process.exit(1);
  }

  const content = await fs.readFile(skillMdPath, "utf8");

  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    console.error(
      chalk.red("Error: Invalid front matter format (missing --- fences)"),
    );
    process.exit(1);
  }

  let frontMatter;
  try {
    frontMatter = yaml.load(match[1]);
  } catch (e) {
    console.error(chalk.red(`Error: YAML parsing failed: ${e.message}`));
    process.exit(1);
  }

  let targetPlatforms = [];
  if (options.platform) {
    if (platforms[options.platform]) {
      targetPlatforms.push(platforms[options.platform]);
    } else {
      console.error(chalk.red(`Error: Unknown platform '${options.platform}'`));
      process.exit(1);
    }
  } else {
    targetPlatforms = Object.values(platforms);
  }

  let successCount = 0;
  const errors = [];

  for (const platform of targetPlatforms) {
    try {
      platform.schema.parse(frontMatter);
      const dirName = path.basename(resolvedPath);
      if (frontMatter.name !== dirName) {
        throw new Error(
          `Directory name '${dirName}' does not match skill name '${frontMatter.name}'`,
        );
      }

      console.log(chalk.green(`✓ Valid ${platform.name} skill`));
      successCount++;
    } catch (e) {
      if (options.platform) {
        if (e.errors) {
          e.errors.forEach((err) => {
            errors.push(
              `[${platform.name}] ${err.path.join(".")}: ${err.message}`,
            );
          });
        } else {
          errors.push(`[${platform.name}] ${e.message}`);
        }
      }
    }
  }

  if (successCount === 0) {
    console.error(chalk.red("Validation Failed:"));
    if (errors.length > 0) {
      errors.forEach((e) => console.error(chalk.red(e)));
    } else {
      console.error(
        chalk.red("Skill does not match any known platform schema."),
      );
    }
    process.exit(1);
  }
}
