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
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{t("preview_title", lang)}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{fileName}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors ${focusRing}`}
              title={t("copy", lang)}
            >
              {copied ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors ${focusRing}`}
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-950 rounded-b-2xl">
          {copied && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg shadow-lg transition-opacity">
              {t("copied", lang)}
            </div>
          )}
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-100 leading-relaxed break-words p-6">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
