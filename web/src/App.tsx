import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "./lib/i18n";
import { t, loadLang, saveLang } from "./lib/i18n";
import { fileId, getExt } from "./lib/file";
import { apiConvert, apiGetJob, apiGetPreview, apiDownloadFile } from "./lib/api";
import type { FileItem, JobResult, JobPhase, Settings } from "./types";
import { gradientBg, container, cardNoHover } from "./lib/ui";

import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import FileDropzone from "./components/FileDropzone";
import FileList from "./components/FileList";
import ConvertSettings from "./components/ConvertSettings";
import ActionPanel from "./components/ActionPanel";
import ResultPanel from "./components/ResultPanel";
import MarkdownPreview from "./components/MarkdownPreview";
import LogPanel from "./components/LogPanel";

export default function App() {
  // Language
  const [lang, setLang] = useState<Lang>(() => loadLang());
  const handleLangChange = (l: Lang) => {
    setLang(l);
    saveLang(l);
  };

  // Files
  const [files, setFiles] = useState<FileItem[]>([]);
  const addFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...newFiles.map((f) => ({
        id: fileId(),
        file: f,
        name: f.name,
        size: f.size,
        ext: getExt(f.name),
        status: "pending" as const,
      })),
    ]);
  }, []);
  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));
  const clearFiles = () => {
    setFiles([]);
    setJobPhase("idle");
    setLogs([]);
    setResults([]);
    setZipResult(null);
    setCurrentFile("");
    setProgress(0);
    setError(null);
  };

  // Settings
  const [settings, setSettings] = useState<Settings>({
    exportAssets: false,
    overwrite: true,
    zipOutput: false,
  });

  // Job state
  const [jobPhase, setJobPhase] = useState<JobPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<JobResult[]>([]);
  const [zipResult, setZipResult] = useState<{ file_name: string; download_url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [logsExpanded, setLogsExpanded] = useState(true);
  const [previewResult, setPreviewResult] = useState<JobResult | null>(null);
  const [previewContent, setPreviewContent] = useState("");

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ---- Start conversion ----
  const handleStart = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setError(null);
    setJobPhase("submitting");
    setLogs([]);
    setResults([]);
    setProgress(0);
    setCurrentFile("");
    setLogsExpanded(true);

    setFiles((prev) =>
      prev.map((f) => (f.status === "pending" ? { ...f, status: "converting" as const } : f))
    );

    try {
      const resp = await apiConvert({
        files: pendingFiles.map((f) => f.file),
        exportAssets: settings.exportAssets,
        overwrite: settings.overwrite,
        zipOutput: settings.zipOutput,
        language: lang,
      });
      setJobPhase("running");
      pollingRef.current = setInterval(() => pollJob(resp.job_id), 500);
    } catch (e: any) {
      setError(e.message || "Request failed");
      setJobPhase("idle");
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "converting" ? { ...f, status: "failed" as const, error: e.message } : f
        )
      );
    }
  };

  // ---- Poll job ----
  const pollJob = async (jid: string) => {
    try {
      const job = await apiGetJob(jid);
      if (!job) return;

      setProgress(job.progress);
      setCurrentFile(job.current_file);
      setLogs([...job.logs]);

      if (job.status === "success") {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setJobPhase("done");
        setResults(job.results);
        setZipResult(job.zip_result || null);
        setFiles((prev) => prev.map((f) => ({ ...f, status: "success" as const })));
      } else if (job.status === "failed") {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setJobPhase("done");
        setError(job.error || "Conversion failed");
        setFiles((prev) =>
          prev.map((f) =>
            f.status === "converting"
              ? { ...f, status: "failed" as const, error: job.error || undefined }
              : f
          )
        );
      }
    } catch {
      // swallow transient poll errors
    }
  };

  // ---- Preview ----
  const handlePreview = async (result: JobResult) => {
    setPreviewResult(result);
    try {
      const id = result.preview_url.split("/").pop()!;
      const content = await apiGetPreview(id);
      setPreviewContent(content || t("preview_empty", lang));
    } catch {
      setPreviewContent(t("error_api", lang));
    }
  };

  const isConverting = jobPhase === "submitting" || jobPhase === "running";
  const hasPending = files.some((f) => f.status === "pending");
  const successCount = jobPhase === "done" ? results.length : 0;
  const failedCount = files.filter((f) => f.status === "failed").length;

  // ---- Render ----
  return (
    <div className={`min-h-screen ${gradientBg} relative overflow-hidden`}>
      {/* Decorative background blobs */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)" }}
      />

      {/* Header */}
      <Header lang={lang} onLangChange={handleLangChange} />

      {/* Main content */}
      <main className={`${container} pb-8 relative z-10`}>
        {/* Dashboard Stats */}
        <section className="mb-6">
          <DashboardStats
            lang={lang}
            total={files.length}
            success={successCount}
            failed={failedCount}
            progress={progress}
          />
        </section>

        {/* Two-column grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left column */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
            {/* Upload */}
            <div className={cardNoHover}>
              <FileDropzone lang={lang} onFiles={addFiles} />
            </div>

            {/* Settings */}
            <div className={`${cardNoHover} p-5`}>
              <ConvertSettings lang={lang} settings={settings} onChange={setSettings} />
            </div>

            {/* Actions */}
            <div className={`${cardNoHover} p-5`}>
              <ActionPanel
                lang={lang}
                hasPending={hasPending}
                isConverting={isConverting}
                hasFiles={files.length > 0}
                progress={progress}
                currentFile={currentFile}
                visible={isConverting || jobPhase === "done"}
                onStart={handleStart}
                onClear={clearFiles}
              />
              {error && (
                <div className="mt-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
                  {error}
                </div>
              )}
            </div>

            {/* Log */}
            <div className={`${cardNoHover} p-5`}>
              <LogPanel
                lang={lang}
                logs={logs}
                expanded={logsExpanded}
                onToggle={() => setLogsExpanded(!logsExpanded)}
              />
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
            {/* File queue */}
            <div className={`${cardNoHover} p-5`}>
              <FileList
                lang={lang}
                files={files}
                onRemove={removeFile}
                onClear={clearFiles}
              />
            </div>

            {/* Results */}
            <div className={`${cardNoHover} p-5`}>
              <ResultPanel
                lang={lang}
                results={results}
                zipUrl={zipResult?.download_url}
                onPreview={handlePreview}
                onDownload={apiDownloadFile}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Preview modal */}
      {previewResult && (
        <MarkdownPreview
          lang={lang}
          content={previewContent}
          fileName={previewResult.file_name}
          onClose={() => {
            setPreviewResult(null);
            setPreviewContent("");
          }}
        />
      )}
    </div>
  );
}
