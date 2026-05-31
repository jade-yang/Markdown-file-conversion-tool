import { FilesIcon, CheckCircleIcon, AlertCircleIcon, ActivityIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";

interface Props {
  lang: Lang;
  total: number;
  success: number;
  failed: number;
  progress: number;
}

const stats = [
  { key: "files", icon: FilesIcon, color: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-700" },
  { key: "success", icon: CheckCircleIcon, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-700" },
  { key: "failed", icon: AlertCircleIcon, color: "from-rose-500 to-rose-600", bg: "bg-rose-50", text: "text-rose-700" },
  { key: "progress", icon: ActivityIcon, color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-700" },
] as const;

const values = (total: number, success: number, failed: number, progress: number) => ({
  files: total,
  success,
  failed,
  progress: `${progress}%`,
});

export default function DashboardStats({ lang, total, success, failed, progress }: Props) {
  const vals = values(total, success, failed, progress);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ key, icon: Icon, bg }) => (
        <div
          key={key}
          className="bg-white/80 backdrop-blur border border-white/70 rounded-2xl shadow-sm p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4.5 h-4.5`} style={{ color: undefined }} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-slate-800 truncate">
                {vals[key]}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {t(`stats_${key}` as any, lang)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
