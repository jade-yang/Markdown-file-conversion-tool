/** Shared types used across components. */

// ---- File item displayed in the file list ----
export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  ext: string;
  status: "pending" | "converting" | "success" | "failed";
  error?: string;
}

// ---- API types ----

export interface ConvertParams {
  files: File[];
  exportAssets: boolean;
  overwrite: boolean;
  zipOutput: boolean;
  language: "zh" | "en";
}

export interface JobResult {
  id: string;
  file_name: string;
  download_url: string;
  preview_url: string;
}

export interface JobStatus {
  job_id: string;
  status: "queued" | "running" | "success" | "failed";
  progress: number; // 0-100
  current_file: string;
  logs: string[];
  results: JobResult[];
  zip_result: { file_name: string; download_url: string } | null;
  error: string | null;
}

export interface ConvertResponse {
  job_id: string;
  status: string;
}

// ---- Settings ----
export interface Settings {
  exportAssets: boolean;
  overwrite: boolean;
  zipOutput: boolean;
}

// ---- App-level types ----
export type JobPhase = "idle" | "submitting" | "running" | "done";
