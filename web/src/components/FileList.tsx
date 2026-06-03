import { ArrowDownIcon, XIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { formatSize } from "../lib/file";
import type { FileItem } from "../types";
import { sectionTitle, btnPrimary, focusRing } from "../lib/ui";
import StatusBadge from "./StatusBadge";

interface Props {
  lang: Lang;
  files: FileItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onScrollToUpload?: () => void;
}

export default function FileList({ lang, files, onRemove, onClear, onScrollToUpload }: Props) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">{t("empty_file_title", lang)}</p>
        <p className="text-xs text-slate-400 mt-1 text-center max-w-[280px]">{t("empty_file_desc", lang)}</p>
        {onScrollToUpload && (
          <button onClick={onScrollToUpload} className={`mt-4 flex items-center gap-1.5 px-4 py-2 text-xs ${btnPrimary} ${focusRing} rounded-xl`}>
            <ArrowDownIcon className="w-3.5 h-3.5" />
            {t("empty_file_action", lang)}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className={sectionTitle}>{t("file_queue", lang)} ({files.length})</h3>
        <button onClick={onClear} className="text-xs text-slate-400 hover:text-rose-500 transition-colors">{t("clear_all", lang)}</button>
      </div>
      <div className="flex flex-col gap-2">
        {files.map((f) => (
          <div key={f.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-slate-500 uppercase">{f.ext.replace(".", "") || "?"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 truncate font-medium" title={f.name}>{f.name}</p>
              <p className="text-xs text-slate-400">{formatSize(f.size)}</p>
            </div>
            <StatusBadge status={f.status} lang={lang} />
            {f.status === "pending" && (
              <button onClick={() => onRemove(f.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title={t("remove_file", lang)}>
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
