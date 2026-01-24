import { describe, it, expect } from "vitest";
import { platforms } from "../src/platforms/index.js";

describe("Platform Schemas", () => {
  it("should validate valid Claude skill", () => {
    const valid = {
      name: "valid-skill",
      description: "A valid skill",
      "allowed-tools": ["Read", "Write"],
      context: "fork",
    };
    expect(() => platforms.claude.schema.parse(valid)).not.toThrow();
  });

  it("should fail Claude skill with invalid name", () => {
    const invalid = {
      name: "Invalid Name",
      description: "A valid skill",
    };
    expect(() => platforms.claude.schema.parse(invalid)).toThrow();
  });

  it("should validate valid OpenCode skill", () => {
    const valid = {
      name: "opencode-skill",
      description: "Test",
      license: "MIT",
      compatibility: "opencode",
    };
    expect(() => platforms.opencode.schema.parse(valid)).not.toThrow();
  });

  it("should validate valid Codex skill", () => {
    const valid = {
      name: "codex-skill",
      description: "Test",
      metadata: { "short-description": "Short" },
    };
    expect(() => platforms.codex.schema.parse(valid)).not.toThrow();
  });

  it("should validate valid Copilot skill", () => {
    const valid = {
      name: "copilot-skill",
      description: "A Copilot skill for testing",
      license: "MIT",
      compatibility: "github-copilot",
      metadata: { author: "test" },
      "allowed-tools": ["Read", "Write"],
    };
    expect(() => platforms.copilot.schema.parse(valid)).not.toThrow();
  });

  it("should reject Copilot skill with uppercase in name", () => {
    const invalid = {
      name: "Copilot-Skill",
      description: "A skill",
    };
    expect(() => platforms.copilot.schema.parse(invalid)).toThrow();
  });

  it("should reject Copilot skill with leading hyphen", () => {
    const invalid = {
      name: "-copilot-skill",
      description: "A skill",
    };
    expect(() => platforms.copilot.schema.parse(invalid)).toThrow();
  });

  it("should reject Copilot skill with trailing hyphen", () => {
    const invalid = {
      name: "copilot-skill-",
      description: "A skill",
    };
    expect(() => platforms.copilot.schema.parse(invalid)).toThrow();
  });

  it("should reject Copilot skill with consecutive hyphens", () => {
    const invalid = {
      name: "copilot--skill",
      description: "A skill",
    };
    expect(() => platforms.copilot.schema.parse(invalid)).toThrow();
  });

  it("should accept Copilot skill with minimal fields", () => {
    const valid = {
      name: "minimal-skill",
      description: "A minimal skill",
    };
    expect(() => platforms.copilot.schema.parse(valid)).not.toThrow();
  });
});
