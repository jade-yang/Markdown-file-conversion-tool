import { useState, useCallback, useEffect, useRef } from "react";
import type { Lang } from "./lib/i18n";
import { t, loadLang, saveLang } from "./lib/i18n";
import { fileId, getExt, isSupportedFile } from "./lib/file";
import { apiConvert, apiGetJob, apiGetPreview, apiDownloadFile } from "./lib/api";
import type { FileItem, JobResult, JobPhase, Settings } from "./types";
import { gradientBg, container, cardNoHover } from "./lib/ui";
import { loadSettings, saveSettings, saveTemplate, loadTemplate, hasTemplate } from "./lib/settings-store";
import { addHistoryEntry, loadHistory, clearHistory, type HistoryEntry } from "./lib/history";
import { SkeletonCard, SkeletonFileItem, SkeletonResultItem } from "./components/Skeleton";
import FeedbackModal from "./components/FeedbackModal";
import HelpCenter from "./components/HelpCenter";
import ToastContainer, { type ToastMessage } from "./components/Toast";

import Landing from "./pages/Landing";
import Header from "./components/Header";
import SeoContent from "./components/SeoContent";
import DashboardStats from "./components/DashboardStats";
import FileDropzone from "./components/FileDropzone";
import FileList from "./components/FileList";
import ConvertSettings from "./components/ConvertSettings";
import ActionPanel from "./components/ActionPanel";
import ResultPanel from "./components/ResultPanel";
import MarkdownPreview from "./components/MarkdownPreview";
import LogPanel from "./components/LogPanel";

type Page = "landing" | "converter";

let toastId = 0;
function nextToastId() { return `toast-${++toastId}`; }

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [lang, setLang] = useState<Lang>(() => loadLang());
  const handleLangChange = (l: Lang) => { setLang(l); saveLang(l); };
  const [helpOpen, setHelpOpen] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [hasConverted, setHasConverted] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  // Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = useCallback((type: ToastMessage["type"], title: string, description?: string) => {
    const id = nextToastId();
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // Settings
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  useEffect(() => { saveSettings(settings); }, [settings]);

  // Files — with duplicate + unsupported detection
  const [files, setFiles] = useState<FileItem[]>([]);
  const addFiles = useCallback((newFiles: File[]) => {
    const supported: File[] = []; let bad = 0;
    for (const f of newFiles) { if (isSupportedFile(f.name)) supported.push(f); else bad++; }

    setHasUploaded(true);

    if (supported.length === 0 && bad > 0) {
      addToast("warning", t("toast_partial", lang, { ok: "0", bad: String(bad) }));
      return;
    }

    setFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}|${f.size}|${f.file.lastModified}`));
      const unique: FileItem[] = []; let dup = 0;

      for (const f of supported) {
        const key = `${f.name}|${f.size}|${f.lastModified}`;
        if (!existing.has(key)) { existing.add(key); unique.push({ id: fileId(), file: f, name: f.name, size: f.size, ext: getExt(f.name), status: "pending" as const }); }
        else { dup++; }
      }

      const added = unique.length;
      if (added === 1) addToast("success", t("toast_file_added", lang), t("toast_ready", lang));
      else if (added > 1) addToast("success", t("toast_files_added", lang, { count: String(added) }), t("toast_ready", lang));
      if (dup > 0) addToast("info", t("toast_duplicates", lang, { count: String(dup) }));
      if (bad > 0) addToast("warning", t("toast_partial", lang, { ok: String(added), bad: String(bad) }));

      if (window.innerWidth < 1024 && added > 0) {
        setTimeout(() => document.getElementById("file-list-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
      }
      return [...prev, ...unique];
    });
  }, [lang, addToast]);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));
  const clearFiles = () => {
    setFiles([]); setJobPhase("idle"); setLogs([]); setResults([]);
    setZipResult(null); setCurrentFile(""); setProgress(0); setError(null);
  };

  // Job state
  const [jobPhase, setJobPhase] = useState<JobPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<JobResult[]>([]);
  const [zipResult, setZipResult] = useState<{ file_name: string; download_url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [resultsHighlight, setResultsHighlight] = useState(false);

  const [logsExpanded, setLogsExpanded] = useState(true);
  const [previewResult, setPreviewResult] = useState<JobResult | null>(null);
  const [previewContent, setPreviewContent] = useState("");
  const [loadingState, setLoadingState] = useState<"idle" | "uploading" | "converting">("idle");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);

  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [showHistory, setShowHistory] = useState(false);
  const templateExists = hasTemplate();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "o") { e.preventDefault(); document.querySelector<HTMLInputElement>('input[type="file"]')?.click(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleStart(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [files, settings, lang]);

  const handleStart = () => { if (settings.overwrite) { setOverwriteConfirmOpen(true); } else { doStart(); } };
  const handleOverwriteConfirm = () => { setOverwriteConfirmOpen(false); doStart(); };

  const doStart = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) return;
    setError(null); setRetrying(false); setResultsHighlight(false);
    setJobPhase("submitting"); setLogs([]); setResults([]);
    setProgress(0); setCurrentFile(""); setLogsExpanded(true); setLoadingState("uploading");
    setFiles((prev) => prev.map((f) => (f.status === "pending" ? { ...f, status: "converting" as const } : f)));
    try {
      const resp = await apiConvert({ files: pending.map((f) => f.file), exportAssets: settings.exportAssets, overwrite: settings.overwrite, zipOutput: settings.zipOutput, language: lang });
      setHasConverted(true); setLoadingState("converting"); setJobPhase("running");
      pollingRef.current = setInterval(() => pollJob(resp.job_id), 500);
    } catch (e: any) {
      setError(e.message || "Request failed"); setJobPhase("idle"); setLoadingState("idle");
      setFiles((prev) => prev.map((f) => f.status === "converting" ? { ...f, status: "failed" as const, error: e.message } : f));
    }
  };

  const pollJob = async (jid: string) => {
    try {
      const job = await apiGetJob(jid); if (!job) return;
      setProgress(job.progress); setCurrentFile(job.current_file); setLogs([...job.logs]);
      if (job.status === "success") {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setJobPhase("done"); setLoadingState("idle");
        setResults(job.results); setZipResult(job.zip_result || null);
        setFiles((prev) => prev.map((f) => ({ ...f, status: "success" as const })));
        setResultsHighlight(true); setTimeout(() => setResultsHighlight(false), 2000);
        if (window.innerWidth < 1024) setTimeout(() => document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
        job.results.forEach((r) => addHistoryEntry({ id: r.id, fileName: r.file_name, fileSize: 0, ext: ".md", status: "success", resultUrl: r.download_url, previewUrl: r.preview_url, timestamp: Date.now() }));
        setHistory(loadHistory());
      } else if (job.status === "failed") {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setJobPhase("done"); setLoadingState("idle"); setError(job.error || "Conversion failed");
        setFiles((prev) => prev.map((f) => f.status === "converting" ? { ...f, status: "failed" as const, error: job.error || undefined } : f));
      }
    } catch { /* swallow */ }
  };

  const handleRetry = async () => {
    setRetrying(true);
    setFiles((prev) => prev.map((f) => f.status === "failed" ? { ...f, status: "pending" as const, error: undefined } : f));
    setError(null); await new Promise((r) => setTimeout(r, 300)); setRetrying(false); handleStart();
  };

  const handlePreview = async (r: JobResult) => {
    setPreviewResult(r);
    try { const id = r.preview_url.split("/").pop()!; const c = await apiGetPreview(id); setPreviewContent(c || t("preview_empty", lang)); }
    catch { setPreviewContent(t("error_api", lang)); }
  };

  const handleSaveTemplate = () => saveTemplate(settings);
  const handleLoadTemplate = () => { const tpl = loadTemplate(); if (tpl) setSettings(tpl); };
  const handleDownload = async (url: string, filename: string) => { setHasDownloaded(true); return apiDownloadFile(url, filename); };
  const scrollToUpload = () => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth", block: "center" });

  const isConverting = jobPhase === "submitting" || jobPhase === "running";
  const hasPending = files.some((f) => f.status === "pending");
  const successCount = jobPhase === "done" ? results.length : 0;
  const failedCount = files.filter((f) => f.status === "failed").length;
  const showSkeleton = loadingState === "uploading" || loadingState === "converting";
  const hasFiles = files.length > 0;

  if (page === "landing") {
    return <Landing onNavigateToConverter={() => setPage("converter")} />;
  }

  return (
    <div className={`min-h-screen ${gradientBg} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)" }} />

      <Header lang={lang} onLangChange={handleLangChange} onOpenHelp={() => setHelpOpen(true)} />

      <main className={`${container} pb-20 relative z-10`}>
        <button onClick={() => setPage("landing")} className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          {lang === "zh" ? "返回首页" : "Back to home"}
        </button>

        <section className="mb-6">
          {showHistory ? (
            <div className={cardNoHover + " p-5"}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "最近转换" : "Recent Conversions"}</h3>
                <div className="flex gap-2">
                  <button onClick={clearHistory} className="text-xs text-slate-400 hover:text-rose-500 transition-colors">{lang === "zh" ? "清空" : "Clear"}</button>
                  <button onClick={() => setShowHistory(false)} className="text-xs text-blue-500 hover:text-blue-700 transition-colors">{lang === "zh" ? "返回仪表盘" : "Back to Dashboard"}</button>
                </div>
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-slate-300 text-center py-4">{lang === "zh" ? "暂无历史记录" : "No history yet"}</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {[...history].reverse().slice(0, 10).map((h) => (
                    <div key={h.id} className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl text-sm">
                      <div className="flex items-center gap-2 min-w-0"><span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${h.status === "success" ? "bg-emerald-400" : "bg-rose-400"}`} /><span className="truncate text-slate-700">{h.fileName}</span></div>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-3">{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <DashboardStats lang={lang} total={files.length} success={successCount} failed={failedCount} progress={progress} />
          )}
        </section>

        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <button onClick={() => setShowHistory(!showHistory)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showHistory ? "bg-blue-100 text-blue-700" : "bg-white/80 text-slate-500 hover:bg-white hover:text-slate-700 border border-white/70"}`}>{lang === "zh" ? "📋 历史记录" : "📋 History"}</button>
          {templateExists && <button onClick={handleLoadTemplate} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 text-slate-500 hover:bg-white hover:text-slate-700 border border-white/70 transition-colors">{lang === "zh" ? "📁 加载模板" : "📁 Load Template"}</button>}
          <button onClick={handleSaveTemplate} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 text-slate-500 hover:bg-white hover:text-slate-700 border border-white/70 transition-colors">{lang === "zh" ? "💾 保存为模板" : "💾 Save Template"}</button>
        </div>

        {/* ===== NEW LAYOUT: FileList + Results ABOVE Upload ===== */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
            {/* 1. File Queue (top) */}
            <div id="file-list-section" className={`${cardNoHover} p-5`}>
              {showSkeleton ? (<div className="space-y-2"><SkeletonFileItem /><SkeletonFileItem /><SkeletonFileItem /></div>) : (<FileList lang={lang} files={files} onRemove={removeFile} onClear={clearFiles} onScrollToUpload={scrollToUpload} />)}
            </div>

            {/* 2. Results */}
            <div id="results-section" className={`${cardNoHover} p-5 ${resultsHighlight ? "ring-2 ring-emerald-300 transition-all duration-500" : ""}`}>
              {showSkeleton ? (<div className="space-y-2"><SkeletonResultItem /><SkeletonResultItem /></div>) : (<ResultPanel lang={lang} results={results} zipUrl={zipResult?.download_url} hasFiles={hasFiles} onPreview={handlePreview} onDownload={handleDownload} />)}
            </div>

            {/* 3. Upload */}
            <div id="upload-section" className={cardNoHover}><FileDropzone lang={lang} onFiles={addFiles} /></div>

            {/* 4. Settings */}
            <div className={`${cardNoHover} p-5`}><ConvertSettings lang={lang} settings={settings} onChange={setSettings} /></div>

            {/* 5. Action */}
            <div className={`${cardNoHover} p-5`}>
              {showSkeleton ? <SkeletonCard /> : <ActionPanel lang={lang} hasPending={hasPending} isConverting={isConverting} hasFiles={hasFiles} progress={progress} currentFile={currentFile} visible={isConverting || jobPhase === "done"} onStart={handleStart} onClear={clearFiles} />}
              {error && (
                <div className="mt-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-sm font-medium text-rose-700">{lang === "zh" ? "转换出现问题" : "Something went wrong"}</p>
                  <p className="text-xs text-rose-500 mt-0.5">{error}</p>
                  <button onClick={handleRetry} disabled={retrying} className="mt-2 px-3 py-1.5 text-xs font-medium bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors disabled:opacity-50">{retrying ? (lang === "zh" ? "重试中…" : "Retrying…") : (lang === "zh" ? "🔄 重试" : "🔄 Retry")}</button>
                </div>
              )}
            </div>

            {/* 6. Log */}
            <div className={`${cardNoHover} p-5`}><LogPanel lang={lang} logs={logs} expanded={logsExpanded} onToggle={() => setLogsExpanded(!logsExpanded)} /></div>
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-7">
            <div className={`${cardNoHover} p-5 ${previewResult ? "" : "h-full flex items-center justify-center"}`}>
              {previewResult ? (
                <MarkdownPreview lang={lang} content={previewContent} fileName={previewResult.file_name} onClose={() => { setPreviewResult(null); setPreviewContent(""); }} />
              ) : (
                <div className="text-center text-slate-300 py-12"><p className="text-sm">{lang === "zh" ? '点击左侧「预览」按钮查看 Markdown' : "Click Preview on the left to view Markdown"}</p></div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SeoContent lang={lang} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <HelpCenter lang={lang} open={helpOpen} onClose={() => setHelpOpen(false)} hasUploaded={hasUploaded} hasConverted={hasConverted} hasDownloaded={hasDownloaded} onOpenFeedback={() => { setHelpOpen(false); setFeedbackOpen(true); }} />
      {feedbackOpen && <FeedbackModal lang={lang} />}

      {overwriteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><span className="text-lg">⚠️</span></div><h3 className="text-base font-bold text-slate-800">{t("overwrite_confirm_title" as any, lang)}</h3></div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{t("overwrite_confirm_desc" as any, lang)}</p>
            <div className="flex gap-3">
              <button onClick={() => setOverwriteConfirmOpen(false)} className="flex-1 px-4 py-2.5 text-sm bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">{t("overwrite_confirm_cancel" as any, lang)}</button>
              <button onClick={handleOverwriteConfirm} className="flex-1 px-4 py-2.5 text-sm font-medium bg-rose-600 text-white rounded-xl shadow-md hover:bg-rose-700 hover:shadow-lg transition-all">{t("overwrite_confirm_proceed" as any, lang)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
