import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import type { FileItem } from "../types";
import { badgeColors } from "../lib/ui";

interface Props {
  status: FileItem["status"];
  lang: Lang;
}

const keys: Record<FileItem["status"], string> = {
  pending:    "status_pending",
  converting: "status_converting",
  success:    "status_success",
  failed:     "status_failed",
};

export default function StatusBadge({ status, lang }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-200 ${
        badgeColors[status]
      } ${status === "converting" ? "animate-pulse" : ""}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === "pending" ? "bg-slate-400" :
          status === "converting" ? "bg-blue-500" :
          status === "success" ? "bg-emerald-500" :
          "bg-rose-500"
        }`}
      />
      {/* @ts-expect-error dynamic key */}
      {t(keys[status], lang)}
    </span>
  );
}
