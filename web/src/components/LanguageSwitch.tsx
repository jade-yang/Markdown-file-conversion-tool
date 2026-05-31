import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";

interface Props {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

export default function LanguageSwitch({ lang, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">{t("lang_label", lang)}</span>
      <div className="flex rounded-lg border border-slate-200 overflow-hidden">
        {(["en", "zh"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => onChange(l)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              lang === l
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {l === "en" ? "EN" : "中文"}
          </button>
        ))}
      </div>
    </div>
  );
}
