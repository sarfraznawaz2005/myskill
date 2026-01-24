import { z } from "zod";

export const agentSkillsBaseSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(64)
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Name must be lowercase alphanumeric with single hyphens, no start/end hyphen",
    ),
  description: z.string().min(1).max(1024),
  license: z.string().optional(),
  compatibility: z.string().max(500).optional(),
  metadata: z.record(z.string()).optional(),
  "allowed-tools": z.union([z.string(), z.array(z.string())]).optional(),
});
