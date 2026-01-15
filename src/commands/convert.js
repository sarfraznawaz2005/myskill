import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import yaml from "js-yaml";
import { platforms } from "../platforms/index.js";
import { generateSkill } from "../templates/generateSkill.js";

export async function convert(sourcePath, options = {}) {
  const resolvedSource = path.resolve(sourcePath);

  if (!options.to) {
    console.error(chalk.red("Error: Target platform (--to) is required"));
    process.exit(1);
  }

  const targetPlatform = platforms[options.to];
  if (!targetPlatform) {
    console.error(chalk.red(`Error: Unknown target platform '${options.to}'`));
    process.exit(1);
  }

  if (!(await fs.pathExists(path.join(resolvedSource, "SKILL.md")))) {
    console.error(chalk.red(`Error: SKILL.md not found in ${resolvedSource}`));
    process.exit(1);
  }

  const content = await fs.readFile(
    path.join(resolvedSource, "SKILL.md"),
    "utf8",
  );
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    console.error(chalk.red("Error: Invalid front matter in source file"));
    process.exit(1);
  }

  let sourceFm;
  try {
    sourceFm = yaml.load(match[1]);
  } catch (e) {
    console.error(chalk.red("Error: YAML parsing failed"));
    process.exit(1);
  }

  const markdownBody = content.replace(/^---\n[\s\S]*?\n---/, "").trim();

  const newFm = {
    name: sourceFm.name,
    description: sourceFm.description,
  };

  if (targetPlatform.id === "opencode") {
    newFm.compatibility = "opencode";
    if (sourceFm.license) newFm.license = sourceFm.license;

    const standardKeys = ["name", "description", "license", "compatibility"];
    const extras = {};
    for (const key of Object.keys(sourceFm)) {
      if (!standardKeys.includes(key)) extras[key] = sourceFm[key];
    }
    if (Object.keys(extras).length > 0) newFm.metadata = extras;
  } else if (targetPlatform.id === "codex") {
    newFm.metadata = { "short-description": sourceFm.description.slice(0, 50) };
  } else if (targetPlatform.id === "claude") {
    if (sourceFm["allowed-tools"])
      newFm["allowed-tools"] = sourceFm["allowed-tools"];
  }

  const newContent = generateSkill(newFm, markdownBody);
  const targetDirName = `${sourceFm.name}_${targetPlatform.id}`;
  const targetDir = path.join(path.dirname(resolvedSource), targetDirName);

  if (await fs.pathExists(targetDir)) {
    if (options.force) {
      // Continue
    } else if (options.nonInteractive) {
      console.error(
        chalk.red(
          `Error: Target directory ${targetDir} already exists. Use --force to overwrite.`,
        ),
      );
      process.exit(1);
    } else {
      console.error(
        chalk.red(`Error: Target directory ${targetDir} already exists`),
      );
      process.exit(1);
    }
  }

  try {
    await fs.ensureDir(targetDir);
    await fs.writeFile(path.join(targetDir, "SKILL.md"), newContent);

    const items = await fs.readdir(resolvedSource);
    for (const item of items) {
      if (item !== "SKILL.md" && item !== ".git" && item !== "node_modules") {
        await fs.copy(
          path.join(resolvedSource, item),
          path.join(targetDir, item),
        );
      }
    }

    console.log(chalk.green(`Successfully converted skill to ${targetDir}`));
  } catch (e) {
    console.error(chalk.red(`Conversion failed: ${e.message}`));
    process.exit(1);
  }
}
