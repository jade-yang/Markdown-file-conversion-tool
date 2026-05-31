export const SUPPORTED_EXTENSIONS = [".txt", ".md", ".docx", ".xlsx", ".pdf", ".pptx"] as const;

export type SupportedExt = (typeof SUPPORTED_EXTENSIONS)[number];

export function isSupportedFile(name: string): boolean {
  const ext = getExt(name);
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);
}

export function getExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let _counter = 0;
export function fileId(): string {
  return `f-${Date.now()}-${++_counter}`;
}
