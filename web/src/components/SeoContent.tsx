import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { container } from "../lib/ui";

interface Props {
  lang: Lang;
}

const content = {
  en: {
    h2Intro: "How It Works",
    h2Formats: "Supported File Formats",
    h2Features: "Features",
    h2FAQ: "Frequently Asked Questions",
    h2Steps: "Quick Start",
    intro: "Markdown Converter helps you convert DOCX, PDF, XLSX, PPTX, TXT, and MD files into Markdown format for documentation, knowledge base migration, blogging, and developer workflows.",
    formats: [
      { ext: "DOCX", desc: "Microsoft Word documents with text, tables, and formatting preserved." },
      { ext: "PDF", desc: "Portable Document Format — extracts text and tables as Markdown." },
      { ext: "XLSX", desc: "Excel spreadsheets — each sheet becomes a Markdown table." },
      { ext: "PPTX", desc: "PowerPoint presentations — slide content extracted to Markdown." },
      { ext: "TXT", desc: "Plain text files — preserved with original encoding." },
      { ext: "MD", desc: "Markdown files — normalized and cleaned." },
    ],
    steps: [
      { title: "Upload Files", desc: "Drag and drop or click to select your documents." },
      { title: "Choose Settings", desc: "Toggle ZIP output, overwrite mode, or asset export." },
      { title: "Convert", desc: "Start the conversion and watch real-time progress." },
      { title: "Download", desc: "Preview the Markdown output and download individual files or a ZIP bundle." },
    ],
    features: [
      "Batch conversion — process multiple files at once",
      "Online Markdown preview — see results before downloading",
      "ZIP download — get all converted files in one click",
      "Bilingual UI — 中文 / English switch",
      "Real-time progress tracking with live logs",
      "Clean Dashboard interface with drag-and-drop",
      "Free to use — no account required",
      "Privacy-first — files are processed temporarily and deleted",
    ],
    faqs: [
      { q: "What file formats does this tool support?", a: "DOCX, PDF, XLSX, PPTX, TXT, and MD. Each format has a dedicated converter optimized for that file type." },
      { q: "Can I download the converted Markdown files?", a: "Yes, each converted file can be downloaded individually as a .md file, or you can download all results as a ZIP bundle." },
      { q: "Does it support batch conversion?", a: "Yes. You can upload multiple files at once and convert them all in a single batch." },
      { q: "Why might PDF-to-Markdown output look incomplete?", a: "Complex PDF layouts rely heavily on the original document structure. Tables and styled text are extracted on a best-effort basis. For best results, use structured PDFs." },
      { q: "Do I need to install anything?", a: "No installation needed. You can use the hosted version at md.906100.xyz, or self-host with Docker." },
    ],
  },
  zh: {
    h2Intro: "工具简介",
    h2Formats: "支持的文件格式",
    h2Features: "功能亮点",
    h2FAQ: "常见问题",
    h2Steps: "快速上手",
    intro: "Markdown 文件转换工具可以将 DOCX、PDF、XLSX、PPTX、TXT 和 MD 文件快速转换为 Markdown 格式，适合文档整理、知识库迁移、博客写作和开发者文档处理。",
    formats: [
      { ext: "DOCX", desc: "Microsoft Word 文档，保留文本、表格和格式。" },
      { ext: "PDF", desc: "便携式文档格式 — 提取文本和表格为 Markdown。" },
      { ext: "XLSX", desc: "Excel 电子表格 — 每个工作表转换为 Markdown 表格。" },
      { ext: "PPTX", desc: "PowerPoint 演示文稿 — 幻灯片内容提取为 Markdown。" },
      { ext: "TXT", desc: "纯文本文件 — 保留原始编码。" },
      { ext: "MD", desc: "Markdown 文件 — 规范化并清理格式。" },
    ],
    steps: [
      { title: "上传文件", desc: "拖拽或点击选择你的文档。" },
      { title: "选择设置", desc: "切换 ZIP 打包、覆盖模式或资源导出选项。" },
      { title: "开始转换", desc: "点击转换按钮，实时查看进度。" },
      { title: "下载结果", desc: "预览 Markdown 输出，下载单个文件或 ZIP 包。" },
    ],
    features: [
      "批量转换 — 一次处理多个文件",
      "在线 Markdown 预览 — 下载前查看结果",
      "ZIP 下载 — 一键获取所有转换文件",
      "中英文界面切换 — 满足不同用户习惯",
      "实时进度追踪 — 详细转换日志",
      "清爽 Dashboard 界面 — 支持拖拽上传",
      "完全免费 — 无需注册账号",
      "隐私优先 — 文件临时处理，用完即删",
    ],
    faqs: [
      { q: "这个工具支持哪些文件格式？", a: "支持 DOCX、PDF、XLSX、PPTX、TXT 和 MD。每种格式都有专用的转换器进行优化处理。" },
      { q: "转换后的 Markdown 可以下载吗？", a: "可以。每个转换后的文件可以单独下载为 .md 文件，也可以将所有结果打包为 ZIP 下载。" },
      { q: "是否支持批量转换？", a: "支持。你可以一次上传多个文件，批量进行转换。" },
      { q: "为什么 PDF 转 Markdown 可能不完整？", a: "复杂 PDF 的排版高度依赖原始文档结构，表格和格式化文本按最大努力提取。使用结构化的 PDF 可获得最佳效果。" },
      { q: "需要安装软件吗？", a: "无需安装。可以直接使用托管版本 md.906100.xyz，或通过 Docker 自行部署。" },
    ],
  },
};

export default function SeoContent({ lang }: Props) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const c = content[lang];

  return (
    <div className={`${container} pb-12`}>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Intro */}
        <section aria-labelledby="seo-intro">
          <h2 id="seo-intro" className="text-xl font-bold text-slate-800 mb-4">
            {c.h2Intro}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            {c.intro}
          </p>
        </section>

        {/* Steps */}
        <section aria-labelledby="seo-steps">
          <h2 id="seo-steps" className="text-xl font-bold text-slate-800 mb-4">
            {c.h2Steps}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {c.steps.map((step, i) => (
              <div key={i} className="bg-white/80 backdrop-blur border border-white/70 rounded-2xl p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-2">
                  <span className="text-sm font-bold text-blue-600">{i + 1}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Format Grid */}
        <section aria-labelledby="seo-formats">
          <h2 id="seo-formats" className="text-xl font-bold text-slate-800 mb-4">
            {c.h2Formats}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {c.formats.map((f) => (
              <div key={f.ext} className="bg-white/80 backdrop-blur border border-white/70 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <h3 className="text-sm font-bold text-slate-800 mb-1">{f.ext}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="seo-features">
          <h2 id="seo-features" className="text-xl font-bold text-slate-800 mb-4">
            {c.h2Features}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {c.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section aria-labelledby="seo-faq">
          <h2 id="seo-faq" className="text-xl font-bold text-slate-800 mb-4">
            {c.h2FAQ}
          </h2>
          <div className="flex flex-col gap-2">
            {c.faqs.map((faq, i) => (
              <div key={i} className="bg-white/80 backdrop-blur border border-white/70 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFAQ === i ? (
                    <ChevronUpIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === i && (
                  <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
