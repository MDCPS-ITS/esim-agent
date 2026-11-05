import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** Credentials come only from saved logins in OpenCode's store, written by `esim-agent login` (ADR-0004). */

/** Providers in `esim-agent login`'s menu order; `label` is what it shows. Detection order: see savedProviders. */
export const PROVIDERS = [
  { id: "opencode-go", label: "OpenCode Go" },
  { id: "openrouter", label: "OpenRouter" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "commandcode", label: "Command Code" },
  { id: "google", label: "Google Gemini" },
  { id: "gauge", label: "Gauge (M-DCPS AI gateway: Gemini on Vertex AI)" },
] as const;

export type Provider = { provider: (typeof PROVIDERS)[number]["id"]; via: "login" };

export const LOGIN_COMMAND = "node ~/Developer/esim-agent/dist/index.js login";
export const NO_PROVIDER = `FAIL reason: no worker provider; run ${LOGIN_COMMAND}`;

/** OpenCode keeps logins for every installed copy in one shared file. */
function authFile() {
  return join(process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"), "opencode", "auth.json");
}

/**
 * Detection order: Gauge first, so with a Gauge key saved the worker always goes through the district gateway, whatever
 * other logins exist on the machine; then the menu order.
 */
const DETECTION = ["gauge", ...PROVIDERS.map((p) => p.id).filter((id) => id !== "gauge")] as Provider["provider"][];

/** Supported providers with a saved login, in detection order. Only the provider ids are used; keys are never kept or passed on. */
export function savedProviders(): Provider["provider"][] {
  let saved: Record<string, unknown>;
  try {
    saved = existsSync(authFile()) ? JSON.parse(readFileSync(authFile(), "utf8")) : {};
  } catch {
    return []; // an unreadable auth file is the same as no login
  }
  return DETECTION.filter((id) => id in saved);
}

export const providerLabel = (id: Provider["provider"]) => PROVIDERS.find((p) => p.id === id)!.label;

/** The provider the worker uses: the first saved login. */
export function detectProvider(): Provider | undefined {
  const [first] = savedProviders();
  return first && { provider: first, via: "login" };
}

/** Strips key-shaped strings (OpenRouter's sk-or-v1-…, DeepSeek/OpenAI-style sk-…, Google's AIza…, Gauge's gauge_…) from anything that leaves the process. */
export function redact(text: string) {
  return text
    .replace(/\bsk-[A-Za-z0-9_-]{16,}/g, "[redacted]")
    .replace(/\bAIza[A-Za-z0-9_-]{30,}/g, "[redacted]")
    .replace(/\bgauge_[A-Za-z0-9_-]{20,}/g, "[redacted]");
}
