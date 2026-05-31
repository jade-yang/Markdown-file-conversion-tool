/** localStorage-backed conversion history. */

const KEY = "mdconv-history";

export interface HistoryEntry {
  id: string;
  fileName: string;
  fileSize: number;
  ext: string;
  status: "success" | "failed";
  resultUrl?: string;
  previewUrl?: string;
  timestamp: number;
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  // Keep last 50 entries
  const trimmed = entries.slice(-50);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function addHistoryEntry(entry: HistoryEntry): void {
  const history = loadHistory();
  // Remove duplicate by id
  const filtered = history.filter((h) => h.id !== entry.id);
  filtered.push(entry);
  saveHistory(filtered);
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}
