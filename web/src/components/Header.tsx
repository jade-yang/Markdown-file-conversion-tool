import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { gradientHeaderLogo } from "../lib/ui";
import LanguageSwitch from "./LanguageSwitch";
import BackendStatus from "./BackendStatus";

interface Props {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}

export default function Header({ lang, onLangChange }: Props) {
  return (
    <header className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 ${gradientHeaderLogo} rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0`}
          >
            <span className="text-white text-base font-bold">M</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {t("title", lang)}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
              {t("subtitle_short", lang)}
            </p>
          </div>
        </div>

        {/* Right: Status + Language */}
        <div className="flex items-center gap-3">
          <BackendStatus lang={lang} />
          <LanguageSwitch lang={lang} onChange={onLangChange} />
        </div>
      </div>
    </header>
  );
}
