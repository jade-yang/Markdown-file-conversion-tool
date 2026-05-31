import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { sectionTitle, logColors } from "../lib/ui";

interface Props {
  lang: Lang;
  logs: string[];
  expanded: boolean;
  onToggle: () => void;
}

function logLevel(line: string): string {
  if (line.startsWith("[ERROR]")) return "error";
  if (line.startsWith("[OK]")) return "success";
  if (line.startsWith("Warning")) return "warning";
  return "info";
}

export default function LogPanel({ lang, logs, expanded, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onToggle}
        className={`flex items-center justify-between ${sectionTitle} hover:text-slate-700 transition-colors`}
      >
        <span>{t("log_title", lang)}</span>
        {expanded ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="bg-slate-950 text-slate-100 font-mono text-xs rounded-2xl p-4 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-slate-500">{t("log_empty", lang)}</p>
          ) : (
            logs.map((line, i) => (
              <div key={i} className={`leading-relaxed ${logColors[logLevel(line)]}`}>
                {line}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
