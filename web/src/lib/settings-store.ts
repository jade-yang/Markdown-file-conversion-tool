/** localStorage-backed settings persistence. */

import type { Settings } from "../types";

const KEY = "mdconv-settings";
const TEMPLATE_KEY = "mdconv-settings-template";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Settings;
  } catch { /* ignore */ }
  return { exportAssets: false, overwrite: false, zipOutput: false };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function saveTemplate(settings: Settings): void {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(settings));
}

export function loadTemplate(): Settings | null {
  try {
    const raw = localStorage.getItem(TEMPLATE_KEY);
    return raw ? (JSON.parse(raw) as Settings) : null;
  } catch {
    return null;
  }
}

export function hasTemplate(): boolean {
  return localStorage.getItem(TEMPLATE_KEY) !== null;
}
