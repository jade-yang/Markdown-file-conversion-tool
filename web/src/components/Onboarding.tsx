import { useState, useEffect } from "react";
import { UploadCloudIcon, PlayIcon, BarChart3Icon, XIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";

const KEY = "mdconv-onboarded";

export function hasOnboarded(): boolean {
  return localStorage.getItem(KEY) === "1";
}

function markOnboarded(): void {
  localStorage.setItem(KEY, "1");
}

interface Props {
  lang: Lang;
  onDismiss: () => void;
}

const steps = {
  en: [
    { icon: UploadCloudIcon, title: "Upload Files", desc: "Drag & drop or click to select .docx, .xlsx, .pdf, .pptx, .txt, or .md files." },
    { icon: PlayIcon, title: "Start Conversion", desc: "Choose your settings (ZIP, overwrite, assets), then click the convert button." },
    { icon: BarChart3Icon, title: "Download Results", desc: "Watch the progress in real time, preview your Markdown, and download the output." },
  ],
  zh: [
    { icon: UploadCloudIcon, title: "上传文件", desc: "拖拽或点击选择 .docx、.xlsx、.pdf、.pptx、.txt、.md 文件。" },
    { icon: PlayIcon, title: "开始转换", desc: "选择设置（ZIP、覆盖、资源），然后点击转换按钮。" },
    { icon: BarChart3Icon, title: "下载结果", desc: "实时查看进度，预览 Markdown 内容，并下载输出文件。" },
  ],
};

export default function Onboarding({ lang, onDismiss }: Props) {
  const [step, setStep] = useState(0);
  const sip = steps[lang];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { markOnboarded(); onDismiss(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDismiss]);

  const done = () => { markOnboarded(); onDismiss(); };
  const next = () => { if (step < sip.length - 1) setStep(step + 1); else done(); };
  const prev = () => { if (step > 0) setStep(step - 1); };
  const current = sip[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 px-6 pt-6 pb-4">
          {sip.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? "w-8 bg-gradient-to-r from-blue-500 to-indigo-600" : "w-4 bg-slate-200"}`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="flex justify-center pb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <Icon className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-6 text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">{current.title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{current.desc}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6 gap-3">
          <button
            onClick={done}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            {lang === "zh" ? "跳过" : "Skip"}
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
              >
                {lang === "zh" ? "上一步" : "Back"}
              </button>
            )}
            <button
              onClick={next}
              className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {step < sip.length - 1 ? (lang === "zh" ? "下一步" : "Next") : (lang === "zh" ? "开始使用" : "Get Started")}
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={done}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label={lang === "zh" ? "关闭引导" : "Close tour"}
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
