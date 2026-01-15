import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function onboard() {
  const agentsMdPath = path.join(__dirname, "..", "..", "AGENTS.md");

  try {
    if (await fs.pathExists(agentsMdPath)) {
      const content = await fs.readFile(agentsMdPath, "utf8");
      console.log(content);
    } else {
      console.error(chalk.red("Error: AGENTS.md not found."));
      if (process.env.NODE_ENV === "test") {
        throw new Error("AGENTS_MD_NOT_FOUND");
      }
      process.exit(1);
    }
  } catch (error) {
    if (error.message === "AGENTS_MD_NOT_FOUND") throw error;
    console.error(
      chalk.red(`Error reading onboarding guide: ${error.message}`),
    );
    if (process.env.NODE_ENV === "test") {
      throw error;
    }
    process.exit(1);
  }
}
