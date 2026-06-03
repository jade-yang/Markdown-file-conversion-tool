import { useEffect } from "react";
import { XIcon, ArrowDownIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";

interface Props {
  open: boolean;
  lang: Lang;
  onClose: () => void;
  onClick: () => void;
}

export default function MobileUploadTip({ open, lang, onClose, onClick }: Props) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClick}
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] lg:hidden"
      role="alert"
    >
      <div className="flex items-center gap-2 min-w-0">
        <ArrowDownIcon className="w-4 h-4 animate-bounce flex-shrink-0" />
        <span className="font-medium truncate">{t("mobile_tip_action" as any, lang)}</span>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="p-1 rounded-lg hover:bg-blue-100 transition-colors flex-shrink-0"
        aria-label={lang === "zh" ? "关闭" : "Close"}
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
