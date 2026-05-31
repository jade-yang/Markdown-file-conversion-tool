import { useState } from "react";
import { MessageSquareIcon, XIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { focusRing } from "../lib/ui";

interface Props {
  lang: Lang;
}

export default function FeedbackModal({ lang }: Props) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [text, setText] = useState("");
  const [type, setType] = useState<"bug" | "feature" | "other">("other");

  const labels = {
    en: { title: "Feedback", desc: "Help us improve — report a bug or suggest a feature.", typeBug: "Bug Report", typeFeature: "Feature Request", typeOther: "Other", placeholder: "Describe your feedback...", send: "Send Feedback", sent: "Thank you! Your feedback has been received.", trigger: "Feedback" },
    zh: { title: "反馈", desc: "帮助我们改进 — 报告问题或提出建议。", typeBug: "问题报告", typeFeature: "功能建议", typeOther: "其他", placeholder: "描述你的反馈...", send: "发送反馈", sent: "感谢！你的反馈已收到。", trigger: "反馈" },
  };

  const lb = labels[lang];

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, text }),
      });
    } catch { /* best-effort */ }
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setText(""); }, 3000);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-lg text-sm text-slate-600 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ${focusRing}`}
        aria-label={lb.trigger}
      >
        <MessageSquareIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{lb.trigger}</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">{lb.title}</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {sent ? (
              <div className="px-6 py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <MessageSquareIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm text-slate-600">{lb.sent}</p>
              </div>
            ) : (
              <>
                {/* Type selector */}
                <div className="px-6 pt-4 flex gap-2">
                  {(["bug", "feature", "other"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        type === t
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {lb[`type${t.charAt(0).toUpperCase() + t.slice(1)}` as keyof typeof lb]}
                    </button>
                  ))}
                </div>

                {/* Textarea */}
                <div className="px-6 py-4">
                  <p className="text-xs text-slate-400 mb-3">{lb.desc}</p>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={lb.placeholder}
                    rows={4}
                    className={`w-full px-4 py-3 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 flex justify-end gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    {lang === "zh" ? "取消" : "Cancel"}
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!text.trim()}
                    className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {lb.send}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
