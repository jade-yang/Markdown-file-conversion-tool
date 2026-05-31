import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import type { Settings } from "../types";
import { sectionTitle } from "../lib/ui";
import ToggleSwitch from "./ToggleSwitch";

export type { Settings } from "../types";

interface Props {
  lang: Lang;
  settings: Settings;
  onChange: (s: Settings) => void;
}

const items: { key: keyof Settings; labelKey: string; descKey: string }[] = [
  { key: "exportAssets", labelKey: "export_assets", descKey: "export_assets_desc" },
  { key: "overwrite",    labelKey: "overwrite",     descKey: "overwrite_desc" },
  { key: "zipOutput",    labelKey: "zip_output",    descKey: "zip_output_desc" },
];

export default function ConvertSettings({ lang, settings, onChange }: Props) {
  const toggle = (key: keyof Settings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className={sectionTitle}>{t("settings_title", lang)}</h3>
      {items.map(({ key, labelKey, descKey }) => (
        <div
          key={key}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50/80 transition-colors"
        >
          <div className="min-w-0 mr-4">
            {/* @ts-expect-error dynamic key */}
            <p className="text-sm text-slate-700">{t(labelKey, lang)}</p>
            {/* @ts-expect-error dynamic key */}
            <p className="text-xs text-slate-400 mt-0.5">{t(descKey, lang)}</p>
          </div>
          <ToggleSwitch checked={settings[key]} onChange={() => toggle(key)} />
        </div>
      ))}
    </div>
  );
}
