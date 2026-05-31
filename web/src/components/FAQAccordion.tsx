import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
  tags: string[];
}

interface Props {
  items: FAQItem[];
  searchQuery: string;
}

export default function FAQAccordion({ items, searchQuery }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = searchQuery
    ? items.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
          item.q.toLowerCase().includes(q) ||
          item.a.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
    : items;

  return (
    <div className="flex flex-col gap-1.5">
      {filtered.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          No matching help topics found.
        </p>
      ) : (
        filtered.map((item, i) => (
          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="pr-2">{item.q}</span>
              <ChevronDownIcon
                className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                  openIdx === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIdx === i && (
              <div className="px-4 pb-3 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                {item.a}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
