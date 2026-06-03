import { useEffect, useState } from "react";
import { XIcon, CheckCircleIcon, AlertTriangleIcon, AlertCircleIcon, InfoIcon } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage { id: string; type: ToastType; title: string; description?: string }

const cfg = {
  success: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900", icon: CheckCircleIcon },
  warning: { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-900",  icon: AlertTriangleIcon },
  error:   { bg: "bg-rose-50",   border: "border-rose-200",   text: "text-rose-900",   icon: AlertCircleIcon },
  info:    { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-900",   icon: InfoIcon },
};

function Item({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const [show, setShow] = useState(false);
  const c = cfg[toast.type]; const Icon = c.icon;
  useEffect(() => { requestAnimationFrame(() => setShow(true)); }, []);
  return (
    <div className={`${c.bg} ${c.border} ${c.text} border rounded-2xl shadow-lg p-4 flex items-start gap-3 transition-all duration-200 max-w-sm w-full ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} role="alert">
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description && <p className="text-xs opacity-80 mt-0.5">{toast.description}</p>}
      </div>
      <button onClick={() => { setShow(false); setTimeout(() => onDismiss(toast.id), 200); }} className="p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"><XIcon className="w-4 h-4" /></button>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed z-50 top-4 right-4 bottom-4 left-4 pointer-events-none flex flex-col items-end gap-2">
      {toasts.map((t) => (<div key={t.id} className="pointer-events-auto"><Item toast={t} onDismiss={onDismiss} /></div>))}
    </div>
  );
}
