import { useState, useEffect, useCallback } from "react";
import {
  XIcon, UploadCloudIcon, SlidersHorizontalIcon, PlayIcon, DownloadIcon,
  FileTextIcon, FileSpreadsheetIcon, FileIcon, PresentationIcon, FileTypeIcon,
  ChevronDownIcon,
} from "lucide-react";
import type { Lang } from "../lib/i18n";
import HelpSearch from "./HelpSearch";
import FAQAccordion from "./FAQAccordion";
import ShortcutGuide from "./ShortcutGuide";
import HelpChecklist from "./HelpChecklist";

interface Props {
  lang: Lang;
  open: boolean;
  onClose: () => void;
  hasUploaded: boolean;
  hasConverted: boolean;
  hasDownloaded: boolean;
  onOpenFeedback: () => void;
}

/* ── Quick Start steps ── */
const quickSteps = {
  en: [
    { icon: UploadCloudIcon, title: "Upload Files", desc: "Drag & drop or click to browse. Supports .docx, .xlsx, .pdf, .pptx, .txt, .md." },
    { icon: SlidersHorizontalIcon, title: "Choose Settings", desc: "Toggle ZIP output, overwrite mode, or asset export." },
    { icon: PlayIcon, title: "Start Conversion", desc: "Click the convert button and watch real-time progress." },
    { icon: DownloadIcon, title: "Download Markdown", desc: "Preview the output, then download individual .md files or a ZIP bundle." },
  ],
  zh: [
    { icon: UploadCloudIcon, title: "上传文件", desc: "拖拽或点击选择，支持 .docx、.xlsx、.pdf、.pptx、.txt、.md。" },
    { icon: SlidersHorizontalIcon, title: "选择设置", desc: "切换 ZIP 打包、覆盖模式或资源导出。" },
    { icon: PlayIcon, title: "开始转换", desc: "点击转换按钮，实时查看进度。" },
    { icon: DownloadIcon, title: "下载 Markdown", desc: "预览输出内容，下载单个 .md 文件或 ZIP 包。" },
  ],
};

/* ── Supported formats ── */
const formats = [
  { ext: "DOCX", icon: FileTextIcon, color: "bg-blue-100 text-blue-700" },
  { ext: "XLSX", icon: FileSpreadsheetIcon, color: "bg-emerald-100 text-emerald-700" },
  { ext: "PDF", icon: FileIcon, color: "bg-rose-100 text-rose-700" },
  { ext: "PPTX", icon: PresentationIcon, color: "bg-orange-100 text-orange-700" },
  { ext: "TXT", icon: FileTypeIcon, color: "bg-slate-100 text-slate-700" },
  { ext: "MD", icon: FileTextIcon, color: "bg-indigo-100 text-indigo-700" },
];

const features = {
  en: ["Batch conversion", "ZIP download", "Markdown preview", "Drag & drop upload", "Bilingual UI"],
  zh: ["批量转换", "ZIP 下载", "Markdown 预览", "拖拽上传", "中英文界面"],
};

/* ── FAQ data ── */
const faqData = {
  en: [
    { q: "Why can't I convert files?", a: "Make sure the backend server is running (uvicorn markdown_converter.web_api:app --port 8000). Check the green status dot in the header.", tags: ["convert", "backend", "server"] },
    { q: "Why is the page blank?", a: "Run 'npm install' in the web/ directory and check the browser console (F12) for errors.", tags: ["blank", "install", "console"] },
    { q: "Why did my upload fail?", a: "Check that your file format is supported (.docx, .xlsx, .pdf, .pptx, .txt, .md). Also verify python-multipart is installed.", tags: ["upload", "format", "file"] },
    { q: "Why is PDF output incomplete?", a: "Complex PDF layouts depend on the original document structure. Tables and text are extracted on a best-effort basis.", tags: ["pdf", "format", "table"] },
    { q: "How do I download all results at once?", a: "Enable 'Package all outputs as ZIP' in the conversion settings before starting.", tags: ["zip", "download", "batch"] },
    { q: "Can I convert multiple files?", a: "Yes! Drag and drop or select multiple files at once. Each file is converted individually.", tags: ["batch", "multiple", "upload"] },
    { q: "What does 'Overwrite' mode do?", a: "When enabled, existing Markdown files with the same name will be replaced permanently. A confirmation dialog will appear before conversion. Keep it off unless you need to update old results.", tags: ["overwrite", "replace", "settings"] },
  ],
  zh: [
    { q: "为什么无法转换文件？", a: "确认后端服务正在运行（uvicorn markdown_converter.web_api:app --port 8000）。检查顶部的绿色状态圆点。", tags: ["convert", "backend", "server"] },
    { q: "为什么页面是空白？", a: "在 web/ 目录运行 'npm install'，并检查浏览器控制台（F12）是否有错误。", tags: ["blank", "install", "console"] },
    { q: "为什么上传失败？", a: "检查文件格式是否支持（.docx、.xlsx、.pdf、.pptx、.txt、.md）。同时确认 python-multipart 已安装。", tags: ["upload", "format", "file"] },
    { q: "为什么 PDF 输出不完整？", a: "复杂 PDF 的排版依赖原始文档结构。表格和文本按最大努力提取。", tags: ["pdf", "format", "table"] },
    { q: "如何一次性下载所有结果？", a: "在转换设置中启用「将所有输出打包为 ZIP」，然后再开始转换。", tags: ["zip", "download", "batch"] },
    { q: "可以批量转换多个文件吗？", a: "可以！拖拽或一次选择多个文件即可。每个文件单独转换。", tags: ["batch", "multiple", "upload"] },
    { q: "覆盖已有文件是什么意思？", a: "开启后，系统将直接替换同名的 Markdown 文件。转换前会弹出确认对话框。建议仅在需要更新旧结果时使用。", tags: ["overwrite", "replace", "settings"] },
  ],
};

/* ── Accordion section helper ── */
function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-1 py-3 text-left"
      >
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

/* ── Component ── */
export default function HelpCenter({ lang, open, onClose, hasUploaded, hasConverted, hasDownloaded, onOpenFeedback }: Props) {
  const [search, setSearch] = useState("");
  const qs = quickSteps[lang];
  const faq = faqData[lang];
  const feat = features[lang];

  // Esc to close
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);
  useEffect(() => {
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleKey]);

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      {/* Drawer */}
      <aside
        className={`
          fixed z-50 bg-white shadow-2xl border-slate-200 overflow-hidden
          /* Desktop: right-side drawer */
          lg:right-0 lg:top-0 lg:h-screen lg:w-[380px] lg:border-l
          lg:transition-transform lg:duration-300
          ${open ? "lg:translate-x-0" : "lg:translate-x-full"}
          /* Mobile: bottom sheet */
          max-lg:inset-x-0 max-lg:bottom-0
          max-lg:rounded-t-3xl max-lg:border-t
          max-lg:transition-transform max-lg:duration-300
          max-lg:max-h-[85vh]
          ${open ? "max-lg:translate-y-0" : "max-lg:translate-y-full"}
        `}
        aria-label={lang === "zh" ? "帮助中心" : "Help Center"}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-base font-bold text-slate-800">
              {lang === "zh" ? "帮助中心" : "Help Center"}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={lang === "zh" ? "关闭" : "Close"}
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="px-5 py-4 flex flex-col gap-5">
              {/* Search */}
              <HelpSearch lang={lang} value={search} onChange={setSearch} />

              {/* Checklist */}
              <Section title={lang === "zh" ? "📋 快速入门" : "📋 Getting Started"} defaultOpen>
                <HelpChecklist lang={lang} uploaded={hasUploaded} converted={hasConverted} downloaded={hasDownloaded} />
              </Section>

              {/* Quick Start — hidden when searching */}
              {!search && (
                <Section title={lang === "zh" ? "🚀 快速开始" : "🚀 Quick Start"} defaultOpen>
                  <div className="flex flex-col gap-2">
                    {qs.map((step, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <step.icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            Step {i + 1}: {step.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Supported formats — hidden when searching */}
              {!search && (
                <Section title={lang === "zh" ? "📄 支持格式" : "📄 Supported Formats"}>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2">
                      {formats.map((f) => (
                        <div key={f.ext} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl ${f.color} bg-opacity-70`}>
                          <f.icon className="w-5 h-5" />
                          <span className="text-[11px] font-bold">{f.ext}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {feat.map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded-lg bg-slate-100 text-[11px] text-slate-600">{f}</span>
                      ))}
                    </div>
                  </div>
                </Section>
              )}

              {/* FAQ */}
              <Section title={lang === "zh" ? "❓ 常见问题" : "❓ FAQ"}>
                <FAQAccordion items={faq} searchQuery={search} />
              </Section>

              {/* Shortcuts — hidden when searching */}
              {!search && (
                <Section title={lang === "zh" ? "⌨️ 快捷键" : "⌨️ Shortcuts"}>
                  <ShortcutGuide lang={lang} />
                </Section>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 flex-shrink-0">
            <button
              onClick={onOpenFeedback}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              {lang === "zh" ? "💬 发送反馈" : "💬 Send Feedback"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
