import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import simpleGit from "simple-git";
import { platforms, getPlatformPath } from "../platforms/index.js";
import { getConfig } from "../utils/config.js";

export async function doctor() {
  console.log(chalk.bold("Running diagnostics..."));
  console.log("");

  let issues = 0;

  // 1. Check Git
  try {
    const git = simpleGit();
    const version = await git.raw(["--version"]);
    console.log(`${chalk.green("✓")} Git installed: ${version.trim()}`);
  } catch (e) {
    console.log(`${chalk.red("✗")} Git not found or error: ${e.message}`);
    issues++;
  }

  // 2. Check Platform Directories
  for (const platform of Object.values(platforms)) {
    const pPath = await getPlatformPath(platform.id);
    try {
      await fs.ensureDir(pPath);
      // Check write access
      const testFile = path.join(pPath, ".write-test");
      await fs.writeFile(testFile, "test");
      await fs.remove(testFile);
      console.log(
        `${chalk.green("✓")} ${platform.name} directory writable: ${pPath}`,
      );
    } catch (e) {
      console.log(
        `${chalk.red("✗")} ${platform.name} directory issue: ${e.message}`,
      );
      issues++;
    }
  }

  // 3. Check Config
  try {
    const config = await getConfig();
    console.log(`${chalk.green("✓")} Config loaded: ${JSON.stringify(config)}`);
  } catch (e) {
    console.log(`${chalk.red("✗")} Config load error: ${e.message}`);
    issues++;
  }

  console.log("");
  if (issues === 0) {
    console.log(chalk.green("All checks passed!"));
  } else {
    console.log(chalk.yellow(`Found ${issues} issues.`));
    // Don't exit with error code, just report
  }
}
