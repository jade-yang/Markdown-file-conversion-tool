import type { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
}

const shortcuts = {
  en: [
    { key: "Ctrl + O", desc: "Select files" },
    { key: "Ctrl + Enter", desc: "Start conversion" },
    { key: "Ctrl + L", desc: "Switch language" },
    { key: "Esc", desc: "Close help panel" },
  ],
  zh: [
    { key: "Ctrl + O", desc: "选择文件" },
    { key: "Ctrl + Enter", desc: "开始转换" },
    { key: "Ctrl + L", desc: "切换语言" },
    { key: "Esc", desc: "关闭帮助面板" },
  ],
};

export default function ShortcutGuide({ lang }: Props) {
  const items = shortcuts[lang];

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
        >
          <span className="text-xs text-slate-600">{item.desc}</span>
          <kbd className="px-2 py-0.5 text-[11px] font-mono font-medium bg-white border border-slate-300 rounded-md text-slate-700 shadow-[0_1px_0_rgba(0,0,0,0.08)]">
            {item.key}
          </kbd>
        </div>
      ))}
    </div>
  );
}
