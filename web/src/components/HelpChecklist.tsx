import { CheckCircleIcon, CircleIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
  uploaded: boolean;
  converted: boolean;
  downloaded: boolean;
}

const steps = {
  en: [
    { key: "uploaded", label: "Upload files" },
    { key: "converted", label: "Start conversion" },
    { key: "downloaded", label: "Download results" },
  ],
  zh: [
    { key: "uploaded", label: "上传文件" },
    { key: "converted", label: "开始转换" },
    { key: "downloaded", label: "下载结果" },
  ],
};

export default function HelpChecklist({ lang, uploaded, converted, downloaded }: Props) {
  const items = steps[lang];
  const status: Record<string, boolean> = { uploaded, converted, downloaded };
  const allDone = uploaded && converted && downloaded;

  return (
    <div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors ${
              status[item.key]
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-slate-200 bg-white"
            }`}
          >
            {status[item.key] ? (
              <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
            ) : (
              <CircleIcon className="w-4 h-4 text-slate-300" />
            )}
            <span
              className={`text-xs ${
                status[item.key] ? "text-emerald-700 line-through" : "text-slate-600"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
      {allDone && (
        <p className="text-xs text-emerald-600 text-center mt-3 font-medium">
          {lang === "zh" ? "🎉 已掌握基本使用流程" : "🎉 You've mastered the basics!"}
        </p>
      )}
    </div>
  );
}
