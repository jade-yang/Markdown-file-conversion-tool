import { InboxIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";

interface Props {
  lang: Lang;
}

export default function EmptyState({ lang }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
        <InboxIcon className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500">{t("empty_title", lang)}</p>
      <p className="text-xs text-slate-400 mt-1">{t("empty_desc", lang)}</p>
    </div>
  );
}
