import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import { spawn } from "child_process";

export async function run(skillName, args = [], options = {}) {
  // Goal: Run the skill script.
  // 1. Locate the skill (reuse find logic logic or simple path check).
  // 2. Identify the entry point (e.g. scripts/run.py, scripts/index.js).
  // 3. Execute it.

  // For simplicity, let's look in current directory first, then use `uninstall`'s detection logic or similar.
  // We'll reuse `uninstall`'s detection logic essentially? Or just rely on current dir for now as experimental.
  // Let's implement a simple path resolver reusing what we learned.

  let targetPath = path.resolve(skillName);

  // If absolute path provided and exists
  if (!(await fs.pathExists(targetPath))) {
    // Try resolving as name in current dir
    targetPath = path.resolve(process.cwd(), skillName);
    if (!(await fs.pathExists(targetPath))) {
      // TODO: Look in global paths if we want to run installed skills.
      // For experimental runner, let's stick to local development context for now or global.
      // Let's assume user provides path or name in current dir.
      console.error(
        chalk.red(`Error: Skill directory '${skillName}' not found.`),
      );
      process.exit(1);
      return; // Ensure return for test mocks
    }
  }

  // Look for entry point
  const scriptsDir = path.join(targetPath, "scripts");
  if (!(await fs.pathExists(scriptsDir))) {
    console.error(
      chalk.red(`Error: 'scripts' directory not found in ${targetPath}`),
    );
    process.exit(1);
    return;
  }

  const potentialEntryPoints = [
    { file: "index.js", cmd: "node" },
    { file: "main.py", cmd: "python" },
    { file: "run.py", cmd: "python" },
    { file: "run.sh", cmd: "bash" },
  ];

  let entryPoint;
  for (const ep of potentialEntryPoints) {
    if (await fs.pathExists(path.join(scriptsDir, ep.file))) {
      entryPoint = ep;
      break;
    }
  }

  if (!entryPoint) {
    console.error(
      chalk.red(
        "Error: No supported entry point found (index.js, main.py, run.py, run.sh).",
      ),
    );
    process.exit(1);
    return;
  }

  console.log(chalk.blue(`Running ${entryPoint.file}...`));

  const scriptPath = path.join(scriptsDir, entryPoint.file);
  const child = spawn(entryPoint.cmd, [scriptPath, ...args], {
    stdio: "inherit",
    cwd: targetPath, // Run in skill root context? Or scripts? Usually root.
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(chalk.red(`Process exited with code ${code}`));
      process.exit(code);
    }
  });
}
