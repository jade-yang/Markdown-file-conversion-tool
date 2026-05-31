import { useEffect, useState } from "react";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";

interface Props {
  lang: Lang;
}

export default function BackendStatus({ lang }: Props) {
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch("/api/health");
        if (!cancelled) setConnected(res.ok);
      } catch {
        if (!cancelled) setConnected(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    check();
    const iv = setInterval(check, 15000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-block w-2 h-2 rounded-full transition-colors duration-300 ${
          checking
            ? "bg-amber-400 animate-pulse"
            : connected
            ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
            : "bg-rose-400"
        }`}
      />
      <span className="text-xs text-slate-500">
        {checking
          ? "..."
          : connected
          ? t("backend_connected", lang)
          : t("backend_disconnected", lang)}
      </span>
    </div>
  );
}
