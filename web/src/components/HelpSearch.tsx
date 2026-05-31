import { SearchIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
  value: string;
  onChange: (v: string) => void;
}

export default function HelpSearch({ lang, value, onChange }: Props) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={lang === "zh" ? "搜索帮助内容..." : "Search help..."}
        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-slate-300"
      />
    </div>
  );
}
