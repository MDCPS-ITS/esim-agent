import { mkdtempSync, mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { loadConfig } from "../src/config.js";
import { removeDir } from "./harness.js";

/** limits.max_escalation_turns: the stronger model's own turn budget after a turn-cap stop. */
function dirs(user: unknown) {
  const root = realpathSync.native(mkdtempSync(join(tmpdir(), "esim-agent-limits-")));
  onTestFinished(() => removeDir(root));
  const home = join(root, "xdg");
  mkdirSync(join(home, "esim-agent"), { recursive: true });
  writeFileSync(join(home, "esim-agent", "config.json"), JSON.stringify(user));
  vi.stubEnv("XDG_CONFIG_HOME", home);
  onTestFinished(() => vi.unstubAllEnvs());
  return root;
}

test("max_escalation_turns defaults to 15 and is read from the user's config", () => {
  expect(loadConfig(dirs({})).limits.max_escalation_turns).toBe(15);
  expect(loadConfig(dirs({ limits: { max_escalation_turns: 120 } })).limits.max_escalation_turns).toBe(120);
});

test("max_escalation_turns must be a positive whole number", () => {
  expect(() => loadConfig(dirs({ limits: { max_escalation_turns: 1.5 } }))).toThrow(/limits\.max_escalation_turns must be a positive whole number/);
  expect(() => loadConfig(dirs({ limits: { max_escalation_turns: 0 } }))).toThrow(/limits\.max_escalation_turns/);
});
