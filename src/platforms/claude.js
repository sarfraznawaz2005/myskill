import { z } from "zod";
import path from "path";
import os from "os";
import { getConfig } from "../utils/config.js";

// We need to make this async or a function to read config
// But index.js exports static objects.
// Let's change the platforms to be functions or getters?
// This is a breaking change for internal architecture.
// Or we can load config synchronously? No, fs-extra is async.
// Best approach: Keep the export structure but make defaultPath a getter or load it once at startup.
// Since `bin/myskill.js` is async, we can initialize platforms there?
// Or just reading config synchronously if we must?
// Node.js supports top-level await in modules.

// Let's try top-level await for config loading since we are in ESM.
let config = {};
try {
  // We can't easily do top level await here without fs/promises and maybe it slows down startup.
  // Instead, let's make `defaultPath` a property we resolve when needed, or check config inside commands.
  // BUT the prompt definitions and validation logic depend on platform definition.
  // The path is mostly used in commands (create, list, etc).
  // So let's change `defaultPath` to a function `getDefaultPath()`.
} catch (e) {}

// For now, I will modify the definitions to export functions or include a resolution helper.
// Actually, simplest is to just expose the hardcoded default as fallback,
// and utility function `getPlatformPath(platformId)` in `utils/config.js` or `platforms/index.js`.

export const claude = {
  id: "claude",
  name: "Claude Code",
  defaultPath: path.join(os.homedir(), ".claude", "skills"),
  schema: z.object({
    name: z
      .string()
      .min(1)
      .max(64)
      .regex(
        /^[a-z0-9-]+$/,
        "Name must be lowercase alphanumeric with hyphens",
      ),
    description: z.string().min(1).max(1024),
    "allowed-tools": z.union([z.string(), z.array(z.string())]).optional(),
    model: z.string().optional(),
    context: z.enum(["fork"]).optional(),
    agent: z.string().optional(),
    hooks: z.any().optional(),
    "user-invocable": z.boolean().optional(),
  }),
  prompts: [
    {
      type: "confirm",
      name: "restrictTools",
      message: "Do you want to restrict allowed tools?",
      default: false,
    },
    {
      type: "input",
      name: "allowedTools",
      message: "Enter allowed tools (comma separated):",
      when: (answers) => answers.restrictTools,
      filter: (input) =>
        input
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
    },
  ],
};
