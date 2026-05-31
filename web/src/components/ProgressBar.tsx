import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";

interface Props {
  lang: Lang;
  progress: number;       // 0-100
  currentFile: string;
  visible: boolean;
}

export default function ProgressBar({ lang, progress, currentFile, visible }: Props) {
  if (!visible) return null;

  return (
    <div className="flex flex-col gap-2">
      {currentFile && (
        <p className="text-xs text-slate-500">
          {t("converting_file", lang, { name: currentFile })}
        </p>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 text-right">{progress}%</p>
    </div>
  );
}
