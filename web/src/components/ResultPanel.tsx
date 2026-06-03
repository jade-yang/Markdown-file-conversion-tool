import { DownloadIcon, EyeIcon, FileArchiveIcon, FileTextIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import type { JobResult } from "../types";
import { sectionTitle, btnSuccess, focusRing } from "../lib/ui";

interface Props {
  lang: Lang;
  results: JobResult[];
  zipUrl?: string;
  hasFiles?: boolean;
  onPreview: (result: JobResult) => void;
  onDownload: (url: string, filename: string) => Promise<void>;
}

export default function ResultPanel({ lang, results, zipUrl, hasFiles, onPreview, onDownload }: Props) {
  if (results.length === 0 && !zipUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
          <FileTextIcon className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-500">{t("empty_result_title", lang)}</p>
        <p className="text-xs text-slate-400 mt-1 text-center max-w-[280px]">
          {hasFiles ? t("empty_result_ready", lang) : t("empty_result_desc", lang)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className={sectionTitle}>{t("results_title", lang)}</h3>
      {zipUrl && (
        <button onClick={() => onDownload(zipUrl, "results.zip")} className={`flex items-center gap-2 px-4 py-3 ${btnSuccess} ${focusRing} rounded-xl text-left`}>
          <FileArchiveIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{t("download_zip", lang)}</span>
        </button>
      )}
      {results.map((r) => (
        <div key={r.id} className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all duration-200">
          <span className="text-sm text-slate-700 truncate mr-3 font-medium" title={r.file_name}>{r.file_name}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => onPreview(r)} className={`flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 ${focusRing}`}>
              <EyeIcon className="w-3.5 h-3.5" />{t("preview", lang)}
            </button>
            <button onClick={() => onDownload(r.download_url, r.file_name)} className={`flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all duration-200 ${focusRing}`}>
              <DownloadIcon className="w-3.5 h-3.5" />{t("download", lang)}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
