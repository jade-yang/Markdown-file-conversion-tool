import { useEffect, useState } from "react";
import { CircleHelpIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { gradientHeaderLogo, focusRing } from "../lib/ui";
import LanguageSwitch from "./LanguageSwitch";
import BackendStatus from "./BackendStatus";

const HELP_SEEN_KEY = "mdconv-help-seen";

export function hasSeenHelp(): boolean {
  return localStorage.getItem(HELP_SEEN_KEY) === "1";
}
export function markHelpSeen(): void {
  localStorage.setItem(HELP_SEEN_KEY, "1");
}

interface Props {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onOpenHelp: () => void;
}

export default function Header({ lang, onLangChange, onOpenHelp }: Props) {
  const [showNewBadge, setShowNewBadge] = useState(false);

  useEffect(() => {
    if (!hasSeenHelp()) setShowNewBadge(true);
  }, []);

  const handleHelpClick = () => {
    if (showNewBadge) { markHelpSeen(); setShowNewBadge(false); }
    onOpenHelp();
  };

  return (
    <header className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${gradientHeaderLogo} rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0`}>
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

        {/* Right: Help + Status + Language */}
        <div className="flex items-center gap-2">
          {/* Help button */}
          <button
            onClick={handleHelpClick}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur border border-slate-200 text-sm text-slate-600 hover:bg-white hover:shadow-md transition-all duration-200 ${focusRing}`}
            aria-label={lang === "zh" ? "帮助" : "Help"}
          >
            <CircleHelpIcon className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-medium">
              {lang === "zh" ? "帮助" : "Help"}
            </span>
            {/* New badge */}
            {showNewBadge && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold leading-none animate-pulse shadow-sm">
                New
              </span>
            )}
          </button>

          <BackendStatus lang={lang} />
          <LanguageSwitch lang={lang} onChange={onLangChange} />
        </div>
      </div>
    </header>
  );
}
