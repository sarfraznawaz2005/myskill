import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import { format } from "prettier";
import { platforms, getPlatform, getPlatformPath } from "../platforms/index.js";
import { generateSkill } from "../templates/generateSkill.js";
import { promptWithCancellation } from "../utils/prompt.js";

export async function create(options = {}) {
  let answers = { ...options };

  if (!options.nonInteractive) {
    console.log(chalk.blue("Interactive Skill Creator"));

    // Step 1: Platform Selection
    if (!answers.platform) {
      const platformAnswer = await promptWithCancellation([
        {
          type: "list",
          name: "platform",
          message: "Select target platform:",
          choices: Object.values(platforms).map((p) => ({
            name: p.name,
            value: p.id,
          })),
        },
      ]);
      answers.platform = platformAnswer.platform;
    }

    const platformConfig = getPlatform(answers.platform);
    if (!platformConfig) {
      console.error(chalk.red(`Error: Unknown platform '${answers.platform}'`));
      return;
    }

    // Helper validation function using Zod schema
    const validateField = (field, value) => {
      const schema = platformConfig.schema.shape[field];
      if (!schema) return true; // No validation defined
      const result = schema.safeParse(value);
      if (result.success) return true;
      return result.error.issues[0].message;
    };

    // Step 2: Name & Description & Scope
    const remainingPrompts = [];
    if (!answers.name) {
      remainingPrompts.push({
        type: "input",
        name: "name",
        message: "Skill Name:",
        validate: (input) => validateField("name", input),
      });
    }

    if (!answers.description) {
      remainingPrompts.push({
        type: "input",
        name: "description",
        message: "Description:",
        validate: (input) => validateField("description", input),
      });
    }

    if (!answers.scope) {
      remainingPrompts.push({
        type: "list",
        name: "scope",
        message: "Where to create the skill?",
        choices: [
          { name: "Current Directory (Project)", value: "project" },
          { name: "Global Skills Directory", value: "global" },
        ],
      });
    }

    // Platform specific prompts
    if (platformConfig.prompts && platformConfig.prompts.length > 0) {
      remainingPrompts.push(...platformConfig.prompts);
    }

    const interactiveAnswers = await promptWithCancellation(remainingPrompts);
    answers = { ...answers, ...interactiveAnswers };
  } else {
    // Non-interactive validation
    if (!answers.platform || !answers.name || !answers.description) {
      console.error(
        chalk.red(
          "Error: --platform, --name, and --description are required in non-interactive mode.",
        ),
      );
      if (process.env.NODE_ENV !== "test") process.exit(1);
      else {
        process.exit(1);
        return;
      }
    }

    const platformConfig = getPlatform(answers.platform);
    if (!platformConfig) {
      console.error(chalk.red(`Error: Unknown platform '${answers.platform}'`));
      if (process.env.NODE_ENV !== "test") process.exit(1);
      else {
        process.exit(1);
        return;
      }
    }

    // Validate using schema
    const result = platformConfig.schema.safeParse({
      name: answers.name,
      description: answers.description,
      ...answers, // includes platform specific flags if any passed? Command options don't map 1:1 to flags yet except name/desc
    });

    if (!result.success) {
      console.error(chalk.red("Validation Error:"));
      result.error.issues.forEach((issue) => {
        console.error(chalk.red(`- ${issue.path.join(".")}: ${issue.message}`));
      });
      if (process.env.NODE_ENV !== "test") process.exit(1);
      else {
        process.exit(1);
        return;
      }
    }
  }

  // Construct Front Matter
  // Filter out internal keys
  const internalKeys = ["scope", "platform", "nonInteractive"];
  const frontMatter = {};

  // We need to merge answers into frontMatter, but ONLY fields that belong to the schema
  // or platform specific prompts.
  // Easiest way: take everything from answers that isn't internal.

  for (const [key, value] of Object.entries(answers)) {
    if (!internalKeys.includes(key)) {
      frontMatter[key] = value;
    }
  }

  // Specific cleanup
  if (frontMatter.restrictTools !== undefined) delete frontMatter.restrictTools;
  if (frontMatter.allowedTools && frontMatter.allowedTools.length === 0)
    delete frontMatter.allowedTools;
  // Also delete confirm if present from previous implementation logic, though here we moved it
  if (frontMatter.confirm !== undefined) delete frontMatter.confirm;

  const platformConfig = getPlatform(answers.platform); // get again to be safe

  let fileContent = generateSkill(frontMatter);

  // Format with Prettier
  try {
    fileContent = await format(fileContent, { parser: "markdown" });
  } catch (e) {
    // Ignore formatting errors, fallback to raw content
  }

  let targetDir;
  if (answers.scope === "global") {
    const globalPath = await getPlatformPath(answers.platform);
    targetDir = path.join(globalPath, answers.name);
  } else {
    const localBase =
      answers.platform === "opencode"
        ? ".opencode/skill"
        : `.${answers.platform}/skills`;
    targetDir = path.join(process.cwd(), localBase, answers.name);
  }

  if (!options.nonInteractive) {
    console.log(chalk.yellow(`\nAbout to create skill at: ${targetDir}`));
    console.log(chalk.gray(fileContent));

    const { confirm } = await promptWithCancellation([
      {
        type: "confirm",
        name: "confirm",
        message: "Proceed?",
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.red("Aborted."));
      return;
    }
  }

  try {
    await fs.ensureDir(targetDir);
    await fs.writeFile(path.join(targetDir, "SKILL.md"), fileContent);
    console.log(chalk.green(`Skill created successfully at ${targetDir}`));
  } catch (error) {
    console.error(chalk.red(`Error creating skill: ${error.message}`));
    if (process.env.NODE_ENV !== "test") process.exit(1);
    else process.exit(1);
  }
}
