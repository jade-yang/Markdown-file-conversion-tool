/** Shared Tailwind CSS class constants for consistent Dashboard styling. */

// ---- Card ----
export const cardClass =
  "bg-white/80 backdrop-blur border border-white/70 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1";

export const cardNoHover =
  "bg-white/80 backdrop-blur border border-white/70 rounded-2xl shadow-sm";

// ---- Buttons ----
export const btnPrimary =
  "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md";

export const btnSecondary =
  "bg-white border border-slate-300 text-slate-700 rounded-xl transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98]";

export const btnDanger =
  "bg-white border border-rose-200 text-rose-600 rounded-xl transition-all duration-200 hover:bg-rose-50 active:scale-[0.98]";

export const btnSuccess =
  "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]";

// ---- Gradients ----
export const gradientBg = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100";

export const gradientHeaderLogo = "bg-gradient-to-br from-blue-600 to-indigo-600";

export const gradientProgress = "bg-gradient-to-r from-blue-500 to-indigo-600";

// ---- Focus ----
export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

// ---- Text ----
export const sectionTitle = "text-xs font-semibold text-slate-500 uppercase tracking-wider";

// ---- Badge colors ----
export const badgeColors: Record<string, string> = {
  pending:    "bg-slate-100 text-slate-600 border-slate-200",
  converting: "bg-blue-50 text-blue-700 border-blue-200",
  success:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed:     "bg-rose-50 text-rose-700 border-rose-200",
};

export const logColors: Record<string, string> = {
  info:    "text-blue-300",
  success: "text-emerald-300",
  error:   "text-rose-300",
  warning: "text-amber-300",
};

// ---- Layout ----
export const container = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
