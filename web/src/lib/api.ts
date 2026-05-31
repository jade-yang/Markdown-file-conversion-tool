/**
 * api.ts — 封装后端 REST API，同时提供 mock 开关用于本地调试。
 *
 * 设为 USE_MOCK = true 时，所有请求走模拟逻辑，无需后端。
 */

import type { ConvertParams, JobResult, JobStatus, ConvertResponse } from "../types";

export type { ConvertParams, JobResult, JobStatus, ConvertResponse } from "../types";

export const USE_MOCK = false;

// ---- Mock 实现 ----

let mockJobCounter = 0;
const mockJobs = new Map<string, JobStatus>();
const mockContent = new Map<string, string>();

function startMockJob(params: ConvertParams): ConvertResponse {
  const jobId = `mock-job-${++mockJobCounter}`;
  const total = params.files.length;

  const job: JobStatus = {
    job_id: jobId,
    status: "running",
    progress: 0,
    current_file: "",
    logs: [`Job ${jobId} started, ${total} file(s)`],
    results: [],
    zip_result: null,
    error: null,
  };
  mockJobs.set(jobId, job);

  // 模拟逐文件转换
  let idx = 0;
  const tick = () => {
    if (idx >= total) {
      job.status = "success";
      job.progress = 100;
      job.current_file = "";
      job.logs.push("All files converted.");
      return;
    }
    const file = params.files[idx];
    job.current_file = file.name;
    job.logs.push(`Converting ${file.name}...`);

    // 模拟读取文件内容为 Markdown（简单地包一层）
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === "string" ? reader.result : "[binary content]";
      const md = `# ${file.name}\n\n${raw}\n`;
      const previewId = `${jobId}-${idx}`;
      mockContent.set(previewId, md);

      job.results.push({
        id: previewId,
        file_name: file.name.replace(/\.[^.]+$/, "") + ".md",
        download_url: `/api/download/${previewId}`,
        preview_url: `/api/preview/${previewId}`,
      });

      job.logs.push(`[OK] ${file.name} -> ${file.name.replace(/\.[^.]+$/, "")}.md`);
      idx++;
      job.progress = Math.round((idx / total) * 100);

      setTimeout(tick, 600);
    };
    reader.onerror = () => {
      job.logs.push(`[ERROR] Failed to read ${file.name}`);
      idx++;
      job.progress = Math.round((idx / total) * 100);
      setTimeout(tick, 600);
    };
    reader.readAsText(file);
  };

  setTimeout(tick, 400);
  return { job_id: jobId, status: "queued" };
}

function getMockJob(jobId: string): JobStatus | null {
  return mockJobs.get(jobId) ?? null;
}

function getMockPreview(previewId: string): string | null {
  return mockContent.get(previewId) ?? null;
}

// ---- 真实 API ----

/** Wraps fetch with auto-retry for transient network errors. */
async function fetchWithRetry(url: string, init?: RequestInit, maxRetries = 2): Promise<Response> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, init);
      return res;
    } catch (err: any) {
      lastErr = err;
      if (attempt < maxRetries) {
        // Wait before retry: 500ms, then 1000ms
        await new Promise((r) => setTimeout(r, (attempt + 1) * 500));
      }
    }
  }
  throw new Error(lastErr?.message || "Network request failed after retries");
}

async function realConvert(params: ConvertParams): Promise<ConvertResponse> {
  const form = new FormData();
  params.files.forEach((f) => form.append("files", f));
  form.append("export_assets", String(params.exportAssets));
  form.append("overwrite", String(params.overwrite));
  form.append("zip_output", String(params.zipOutput));
  form.append("language", params.language);

  const res = await fetchWithRetry("/api/convert", { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(res.status === 0 ? "Cannot connect to backend server. Make sure it is running on port 8000." : `Server error (${res.status})${text ? ": " + text : ""}`);
  }
  return res.json();
}

async function realGetJob(jobId: string): Promise<JobStatus> {
  const res = await fetchWithRetry(`/api/jobs/${jobId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function realGetPreview(previewId: string): Promise<string> {
  const res = await fetchWithRetry(`/api/preview/${previewId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// ---- 统一导出 ----

export async function apiConvert(params: ConvertParams): Promise<ConvertResponse> {
  if (USE_MOCK) return startMockJob(params);
  return realConvert(params);
}

export async function apiGetJob(jobId: string): Promise<JobStatus | null> {
  if (USE_MOCK) return getMockJob(jobId);
  return realGetJob(jobId);
}

export async function apiGetPreview(previewId: string): Promise<string | null> {
  if (USE_MOCK) return getMockPreview(previewId);
  return realGetPreview(previewId);
}

export function apiDownloadUrl(result: JobResult): string {
  return result.download_url;
}

export async function apiDownloadFile(url: string, filename: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
