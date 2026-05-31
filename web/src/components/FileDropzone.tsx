import { useCallback, useState } from "react";
import { UploadCloudIcon } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { isSupportedFile } from "../lib/file";
import { btnPrimary, focusRing } from "../lib/ui";

interface Props {
  lang: Lang;
  onFiles: (files: File[]) => void;
}

export default function FileDropzone({ lang, onFiles }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const accepted = Array.from(fileList).filter((f) => isSupportedFile(f.name));
      if (accepted.length > 0) onFiles(accepted);
    },
    [onFiles]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <label
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      className={`
        flex flex-col items-center justify-center gap-3 p-8
        rounded-3xl border-2 border-dashed cursor-pointer
        transition-all duration-200
        ${dragOver
          ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100 scale-[1.01]"
          : "border-slate-300 bg-gradient-to-br from-white to-blue-50/50 hover:border-blue-400 hover:bg-blue-50/80"
        }
      `}
    >
      <UploadCloudIcon className={`w-10 h-10 transition-colors duration-200 ${dragOver ? "text-blue-600" : "text-slate-400"}`} />
      <p className="text-sm font-medium text-slate-700">
        {dragOver ? t("dropzone_active", lang) : t("dropzone_title", lang)}
      </p>
      <p className="text-xs text-slate-400">{t("dropzone_formats", lang)}</p>
      <span className={`mt-1 px-5 py-2.5 rounded-xl text-sm font-medium ${btnPrimary} ${focusRing} pointer-events-none`}>
        <UploadCloudIcon className="w-4 h-4 inline mr-1.5 -mt-0.5" />
        {t("browse_files", lang)}
      </span>
      <input
        type="file"
        className="hidden"
        multiple
        accept=".txt,.md,.docx,.xlsx,.pdf,.pptx"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </label>
  );
}
