import { XIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { formatSize } from "../lib/file";
import type { FileItem } from "../types";
import { sectionTitle } from "../lib/ui";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";

interface Props {
  lang: Lang;
  files: FileItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function FileList({ lang, files, onRemove, onClear }: Props) {
  if (files.length === 0) {
    return <EmptyState lang={lang} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className={sectionTitle}>
          {t("file_queue", lang)} ({files.length})
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
        >
          {t("clear_all", lang)}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {files.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            {/* File icon */}
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                {f.ext.replace(".", "") || "?"}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 truncate font-medium" title={f.name}>
                {f.name}
              </p>
              <p className="text-xs text-slate-400">
                {formatSize(f.size)}
              </p>
            </div>

            {/* Status */}
            <StatusBadge status={f.status} lang={lang} />

            {/* Remove */}
            {f.status === "pending" && (
              <button
                onClick={() => onRemove(f.id)}
                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                title={t("remove_file", lang)}
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
