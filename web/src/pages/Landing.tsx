import { useState, useEffect, useCallback, useRef } from "react";
import type { Lang } from "../lib/i18n";
import { loadLang, saveLang } from "../lib/i18n";
import {
  ArrowRight,
  FileText,
  FileSpreadsheet,
  FileImage,
  Presentation,
  Terminal,
  Globe,
  Download,
  Eye,
  Upload,
  Zap,
  Copy,
  Check,
  Menu,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface FormatInfo {
  ext: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface FeatureItem {
  title: string;
  body: string;
  icon: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

function makeFormats(lang: Lang): FormatInfo[] {
  return [
    {
      ext: ".docx",
      label: "Word",
      icon: <FileText className="w-8 h-8" />,
      description:
        lang === "zh"
          ? "保留标题、列表、表格结构"
          : "Preserves headings, lists, and table structures",
    },
    {
      ext: ".xlsx",
      label: "Excel",
      icon: <FileSpreadsheet className="w-8 h-8" />,
      description:
        lang === "zh"
          ? "工作表自动转为 Markdown 表格"
          : "Sheets convert to Markdown tables automatically",
    },
    {
      ext: ".pdf",
      label: "PDF",
      icon: <FileImage className="w-8 h-8" />,
      description:
        lang === "zh"
          ? "提取文本内容，尽力保留布局"
          : "Extracts text content with best-effort layout preservation",
    },
    {
      ext: ".pptx",
      label: "PowerPoint",
      icon: <Presentation className="w-8 h-8" />,
      description:
        lang === "zh"
          ? "幻灯片文本及备注转为 Markdown"
          : "Slide text and notes converted to Markdown",
    },
    {
      ext: ".txt",
      label: "Plain Text",
      icon: <FileText className="w-8 h-8" />,
      description:
        lang === "zh"
          ? "纯文本直通，零开销转换"
          : "Plain text passthrough with zero overhead",
    },
    {
      ext: ".md",
      label: "Markdown",
      icon: <FileText className="w-8 h-8" />,
      description:
        lang === "zh"
          ? "Markdown 文件原样保留"
          : "Markdown files preserved as-is",
    },
  ];
}

function makeFeatures(lang: Lang): FeatureItem[] {
  return [
    {
      icon: <Upload className="w-5 h-5" />,
      title: lang === "zh" ? "拖拽上传" : "Drag and drop",
      body:
        lang === "zh"
          ? "直接将文件拖入页面，或点击选择。支持单文件和批量文件夹上传。"
          : "Drop files directly onto the page, or click to browse. Supports single files and batch folder uploads.",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: lang === "zh" ? "实时进度" : "Live progress",
      body:
        lang === "zh"
          ? "转换过程中实时显示进度条、当前文件名和详细日志，无需盲等。"
          : "Real-time progress bar, current file name, and detailed conversion log while processing.",
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: lang === "zh" ? "在线预览" : "Inline preview",
      body:
        lang === "zh"
          ? "转换完成后在浏览器内直接预览 Markdown 内容，确认结果再下载。"
          : "Preview Markdown output directly in the browser before downloading.",
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: lang === "zh" ? "灵活下载" : "Flexible download",
      body:
        lang === "zh"
          ? "单文件下载或一键打包 ZIP，支持导出图片资源到独立目录。"
          : "Download individual files or bundle everything as ZIP. Optionally export image assets to a separate folder.",
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      title: lang === "zh" ? "命令行工具" : "CLI tool",
      body:
        lang === "zh"
          ? "提供命令行接口，可集成到自动化脚本和 CI/CD 流程中。"
          : "Command-line interface available for automation scripts and CI/CD pipelines.",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: lang === "zh" ? "双语界面" : "Bilingual UI",
      body:
        lang === "zh"
          ? "完整的中英文界面支持，自动跟随系统语言，也可手动切换。"
          : "Full Chinese and English UI, auto-detects system language with manual toggle.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function cls(...args: (string | false | null | undefined)[]): string {
  return args.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** Copy-to-clipboard button for code blocks. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handle}
      className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white transition-colors"
      aria-label="Copy code"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

/** Animated counter (counts up on scroll into view). */
function useCountUp(target: number, duration: number, startCounting: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, startCounting]);
  return count;
}

/* ------------------------------------------------------------------ */
/*  Section: Nav                                                       */
/* ------------------------------------------------------------------ */

function Nav({
  lang,
  onLangChange,
  onTryClick,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onTryClick: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={cls(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 shadow-sm"
          : "bg-transparent"
      )}
      style={{ height: 64 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 font-semibold text-zinc-900 text-base no-underline">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            M
          </span>
          <span className="hidden sm:inline">Markdown Converter</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onLangChange(lang === "zh" ? "en" : "zh")}
            className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            {lang === "zh" ? "English" : "中文"}
          </button>
          <button
            onClick={onTryClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all duration-200 active:scale-[0.98]"
          >
            {lang === "zh" ? "开始转换" : "Try it now"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-zinc-600"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 px-4 pb-4 pt-2 flex flex-col gap-3">
          <button
            onClick={() => {
              onLangChange(lang === "zh" ? "en" : "zh");
              setMobileOpen(false);
            }}
            className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors text-left"
          >
            {lang === "zh" ? "English" : "中文"}
          </button>
          <button
            onClick={() => {
              onTryClick();
              setMobileOpen(false);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all duration-200 active:scale-[0.98]"
          >
            {lang === "zh" ? "开始转换" : "Try it now"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Hero                                                      */
/* ------------------------------------------------------------------ */

function Hero({ lang, onTryClick }: { lang: Lang; onTryClick: () => void }) {
  const formats = makeFormats(lang);

  return (
    <section className="min-h-[100dvh] flex items-center pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-[0.16em] mb-4">
                {lang === "zh" ? "开源文档转换工具" : "Open-source document converter"}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] text-zinc-900">
                {lang === "zh"
                  ? "将任何文档转为 Markdown"
                  : "Convert any document to Markdown"}
              </h1>
              <p className="mt-5 text-base md:text-lg text-zinc-500 leading-relaxed max-w-[55ch]">
                {lang === "zh"
                  ? "支持 DOCX、PDF、XLSX、PPTX、TXT 等格式。拖拽上传，秒级转换，在线预览，批量下载。"
                  : "Supports DOCX, PDF, XLSX, PPTX, TXT and more. Drag, drop, convert in seconds, preview online, batch download."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onTryClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-md transition-all duration-200 active:scale-[0.98]"
              >
                {lang === "zh" ? "开始转换" : "Try it now"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all duration-200 active:scale-[0.98]"
              >
                <Terminal className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>

          {/* Right: format grid visual */}
          <div className="grid grid-cols-3 gap-3">
            {formats.map((fmt) => (
              <div
                key={fmt.ext}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-zinc-200/70 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-zinc-700">{fmt.icon}</span>
                <span className="text-xs font-medium text-zinc-500">{fmt.label}</span>
                <span className="text-[10px] text-zinc-400 font-mono">{fmt.ext}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Stats                                                     */
/* ------------------------------------------------------------------ */

function Stats({ lang }: { lang: Lang }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const formats = useCountUp(6, 1200, visible);
  const langs = useCountUp(2, 800, visible);

  return (
    <section ref={ref} className="py-16 border-y border-zinc-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900">
              {formats}
            </p>
            <p className="mt-1.5 text-sm text-zinc-500">
              {lang === "zh" ? "支持格式" : "Formats supported"}
            </p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900">
              CLI
            </p>
            <p className="mt-1.5 text-sm text-zinc-500">
              {lang === "zh" ? "命令行 + Docker" : "CLI + Docker"}
            </p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900">
              {langs}
            </p>
            <p className="mt-1.5 text-sm text-zinc-500">
              {lang === "zh" ? "界面语言" : "Interface languages"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Feature Bento                                             */
/* ------------------------------------------------------------------ */

function FeatureBento({ lang }: { lang: Lang }) {
  const features = makeFeatures(lang);

  // Use a 3+3 split into two rows with varied visual treatment
  const topRow = features.slice(0, 3);
  const bottomRow = features.slice(3, 6);

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-zinc-900">
            {lang === "zh" ? "功能特性" : "Features"}
          </h2>
        </div>

        {/* Top row: 3 cards with varied backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {topRow.map((feat, i) => {
            const bgClasses = [
              "bg-zinc-50",
              "bg-gradient-to-br from-blue-50 to-indigo-50",
              "bg-zinc-50",
            ];
            return (
              <div
                key={feat.title}
                className={cls(
                  "rounded-2xl p-6 border border-zinc-200/60 transition-all duration-200 hover:shadow-md",
                  bgClasses[i]
                )}
              >
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-zinc-200/60 text-zinc-700 mb-4">
                  {feat.icon}
                </span>
                <h3 className="text-sm font-semibold text-zinc-800 mb-1.5">{feat.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feat.body}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom row: 3 cards with varied backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bottomRow.map((feat, i) => {
            const bgVariants = [
              "bg-zinc-900 text-white border-zinc-800",
              "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100",
              "bg-white border-zinc-200/60",
            ];
            const isDark = i === 0;
            return (
              <div
                key={feat.title}
                className={cls(
                  "rounded-2xl p-6 border transition-all duration-200 hover:shadow-md",
                  bgVariants[i]
                )}
              >
                <span
                  className={cls(
                    "inline-flex items-center justify-center w-9 h-9 rounded-xl border mb-4",
                    isDark
                      ? "bg-white/10 border-white/15 text-white"
                      : "bg-white border-zinc-200/60 text-zinc-700"
                  )}
                >
                  {feat.icon}
                </span>
                <h3
                  className={cls(
                    "text-sm font-semibold mb-1.5",
                    isDark ? "text-white" : "text-zinc-800"
                  )}
                >
                  {feat.title}
                </h3>
                <p
                  className={cls(
                    "text-sm leading-relaxed",
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  )}
                >
                  {feat.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Code Snippets (CLI + Docker)                              */
/* ------------------------------------------------------------------ */

function CodeSnippets({ lang }: { lang: Lang }) {
  const cliCode = "mdconvert report.docx -o output";
  const dockerCode = "docker compose up -d";

  return (
    <section className="py-20 md:py-28 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-zinc-900">
            {lang === "zh" ? "快速开始" : "Quick start"}
          </h2>
          <p className="mt-3 text-base text-zinc-500 max-w-[55ch]">
            {lang === "zh"
              ? "除了网页界面，还提供命令行工具和 Docker 一键部署。"
              : "Beyond the web UI, a CLI tool and one-command Docker deployment are available."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CLI */}
          <div className="rounded-2xl overflow-hidden border border-zinc-200/60 bg-zinc-900">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 text-[11px] text-zinc-500 font-mono">
                {lang === "zh" ? "命令行" : "Terminal"}
              </span>
            </div>
            <div className="relative px-5 py-4 font-mono text-sm">
              <span className="text-emerald-400">$ </span>
              <span className="text-zinc-300">{cliCode}</span>
              <CopyButton text={cliCode} />
            </div>
          </div>

          {/* Docker */}
          <div className="rounded-2xl overflow-hidden border border-zinc-200/60 bg-zinc-900">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 text-[11px] text-zinc-500 font-mono">
                {lang === "zh" ? "Docker" : "Docker"}
              </span>
            </div>
            <div className="relative px-5 py-4 font-mono text-sm">
              <span className="text-emerald-400">$ </span>
              <span className="text-zinc-300">{dockerCode}</span>
              <CopyButton text={dockerCode} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Format Cards (bento-style grid with real visual variety)  */
/* ------------------------------------------------------------------ */

function FormatGrid({ lang }: { lang: Lang }) {
  const formats = makeFormats(lang);

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-zinc-900">
            {lang === "zh" ? "支持的文件格式" : "Supported formats"}
          </h2>
        </div>

        {/* Asymmetric bento: 3 cols with varied spans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formats.map((fmt, i) => {
            // Vary visual treatment per card
            const isDark = i === 0;
            const isGradient = i === 2;
            const isBorderAccent = i === 4;

            return (
              <div
                key={fmt.ext}
                className={cls(
                  "rounded-2xl p-6 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                  isDark
                    ? "bg-zinc-900 border-zinc-800 text-white"
                    : isGradient
                      ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                      : isBorderAccent
                        ? "bg-white border-zinc-200/60 ring-2 ring-blue-500/20"
                        : "bg-white border-zinc-200/60"
                )}
              >
                <span
                  className={cls(
                    "inline-flex items-center justify-center w-10 h-10 rounded-xl border mb-4",
                    isDark
                      ? "bg-white/10 border-white/15 text-white"
                      : "bg-white border-zinc-200/60 text-zinc-600"
                  )}
                >
                  {fmt.icon}
                </span>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <h3
                    className={cls(
                      "text-base font-semibold",
                      isDark ? "text-white" : "text-zinc-800"
                    )}
                  >
                    {fmt.label}
                  </h3>
                  <span
                    className={cls(
                      "text-xs font-mono",
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    {fmt.ext}
                  </span>
                </div>
                <p
                  className={cls(
                    "text-sm leading-relaxed",
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  )}
                >
                  {fmt.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: CTA                                                       */
/* ------------------------------------------------------------------ */

function CTASection({ lang, onTryClick }: { lang: Lang; onTryClick: () => void }) {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-zinc-900 px-8 py-14 md:py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-white">
            {lang === "zh" ? "准备好开始转换了吗？" : "Ready to start converting?"}
          </h2>
          <p className="mt-3 text-base text-zinc-400 max-w-[45ch] mx-auto">
            {lang === "zh"
              ? "免费、开源、无需注册。直接拖入文件即可。"
              : "Free, open-source, no signup required. Just drop your files in."}
          </p>
          <button
            onClick={onTryClick}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-900 bg-white hover:bg-zinc-100 rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98]"
          >
            {lang === "zh" ? "开始转换" : "Try it now"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Footer                                                    */
/* ------------------------------------------------------------------ */

function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="py-10 border-t border-zinc-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
            M
          </span>
          <span>Markdown Converter</span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            GitHub
          </a>
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-400">
            {lang === "zh" ? "开源免费" : "Free & open-source"}
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Landing Page                                                  */
/* ------------------------------------------------------------------ */

export default function Landing({
  onNavigateToConverter,
}: {
  onNavigateToConverter: () => void;
}) {
  const [lang, setLang] = useState<Lang>(() => loadLang());

  const handleLangChange = (l: Lang) => {
    setLang(l);
    saveLang(l);
  };

  // Smooth scroll to converter section (handled by parent via callback)
  const handleTryClick = () => {
    onNavigateToConverter();
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Nav lang={lang} onLangChange={handleLangChange} onTryClick={handleTryClick} />

      <Hero lang={lang} onTryClick={handleTryClick} />

      <Stats lang={lang} />

      <FormatGrid lang={lang} />

      <FeatureBento lang={lang} />

      <CodeSnippets lang={lang} />

      <CTASection lang={lang} onTryClick={handleTryClick} />

      <Footer lang={lang} />
    </div>
  );
}
