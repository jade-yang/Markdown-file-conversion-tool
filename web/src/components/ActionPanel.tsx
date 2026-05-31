import { Loader2Icon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { btnPrimary, btnSecondary, gradientProgress, focusRing } from "../lib/ui";

interface Props {
  lang: Lang;
  hasPending: boolean;
  isConverting: boolean;
  hasFiles: boolean;
  progress: number;
  currentFile: string;
  visible: boolean;
  onStart: () => void;
  onClear: () => void;
}

export default function ActionPanel({
  lang,
  hasPending,
  isConverting,
  hasFiles,
  progress,
  currentFile,
  visible,
  onStart,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onStart}
          disabled={!hasPending || isConverting}
          className={`flex-1 h-12 rounded-2xl text-sm ${btnPrimary} ${focusRing} flex items-center justify-center gap-2`}
          aria-label={isConverting ? t("converting", lang) : t("start_convert", lang)}
        >
          {isConverting && <Loader2Icon className="w-4 h-4 animate-spin" />}
          {isConverting ? t("converting", lang) : t("start_convert", lang)}
        </button>
        {hasFiles && (
          <button
            onClick={onClear}
            disabled={isConverting}
            className={`px-4 h-12 rounded-2xl text-sm ${btnSecondary} ${focusRing}`}
            aria-label={t("clear_all", lang)}
          >
            {t("clear_all", lang)}
          </button>
        )}
      </div>

      {/* Current file */}
      {visible && currentFile && (
        <p className="text-xs text-slate-500 truncate">
          {t("converting_file", lang, { name: currentFile })}
        </p>
      )}

      {/* Progress bar */}
      {visible && (
        <div className="flex flex-col gap-1.5">
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${gradientProgress}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 text-right font-medium">{progress}%</p>
        </div>
      )}
    </div>
  );
}
