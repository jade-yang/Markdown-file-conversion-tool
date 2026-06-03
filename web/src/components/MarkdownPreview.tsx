import { useState } from "react";
import { XIcon, CopyIcon, CheckIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { focusRing } from "../lib/ui";

interface Props {
  lang: Lang;
  content: string;
  fileName: string;
  onClose: () => void;
}

export default function MarkdownPreview({ lang, content, fileName, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  const isEmpty = !content;

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm flex flex-col">
      {/* Header toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 flex-shrink-0">
        <div className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
          {fileName}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleCopy}
            disabled={isEmpty}
            className={`p-1.5 rounded-lg transition-colors ${focusRing} ${isEmpty ? "text-slate-300 cursor-not-allowed" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"}`}
            title={t("copy", lang)}
          >
            {copied ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors ${focusRing}`}
            title={t("close", lang)}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="markdown-preview max-h-[50vh] lg:max-h-[70vh] w-full max-w-full overflow-auto rounded-b-2xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 sm:text-sm">
        {/* Copied toast */}
        {copied && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg shadow-lg z-10 transition-opacity">
            {lang === "zh" ? "已复制 Markdown 内容" : "Markdown copied"}
          </div>
        )}

        {isEmpty ? (
          <p className="text-slate-500 text-center py-8">{t("preview_empty", lang)}</p>
        ) : (
          <pre className="m-0 whitespace-pre-wrap break-words max-w-full">
            <code className="whitespace-pre-wrap break-words">{content}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
