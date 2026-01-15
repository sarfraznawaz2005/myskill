import { z } from "zod";
import path from "path";
import os from "os";

export const opencode = {
  id: "opencode",
  name: "OpenCode",
  defaultPath: path.join(os.homedir(), ".config", "opencode", "skill"),
  schema: z.object({
    name: z
      .string()
      .min(1)
      .max(64)
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "Name must be lowercase alphanumeric, single hyphens only, no start/end hyphen",
      ),
    description: z.string().min(1).max(1024),
    license: z.string().optional(),
    compatibility: z.string().optional(),
    metadata: z.record(z.string()).optional(),
  }),
  prompts: [
    {
      type: "input",
      name: "license",
      message: "License (e.g., MIT):",
    },
    {
      type: "input",
      name: "compatibility",
      message: "Compatibility (e.g., opencode):",
      default: "opencode",
    },
  ],
};
