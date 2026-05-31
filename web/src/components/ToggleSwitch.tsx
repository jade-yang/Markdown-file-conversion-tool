import { focusRing } from "../lib/ui";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}

export default function ToggleSwitch({ checked, onChange, disabled, variant = "default" }: Props) {
  const activeBg = variant === "danger"
    ? "bg-gradient-to-r from-amber-500 to-rose-500"
    : "bg-gradient-to-r from-blue-600 to-indigo-600";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${focusRing} ${
        checked ? activeBg : "bg-slate-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[1.625rem]" : "translate-x-1"
        }`}
      />
    </button>
  );
}
