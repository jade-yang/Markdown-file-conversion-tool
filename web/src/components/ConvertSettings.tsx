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
      {items.map(({ key, labelKey, descKey }) => {
        const isOverwrite = key === "overwrite";
        const isOverwriteOn = isOverwrite && settings.overwrite;

        return (
          <div
            key={key}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
              isOverwriteOn ? "bg-amber-50/80 border border-amber-200" : "hover:bg-slate-50/80"
            }`}
          >
            <div className="min-w-0 mr-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-700">
                  {/* @ts-expect-error dynamic key */}
                  {t(labelKey, lang)}
                </p>
                {/* Warning badge for overwrite */}
                {isOverwriteOn && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                    {t("overwrite_badge" as any, lang)}
                  </span>
                )}
              </div>
              {/* Description changes when overwrite is on */}
              <p className={`text-xs mt-0.5 ${isOverwriteOn ? "text-amber-600 font-medium" : "text-slate-400"}`}>
                {isOverwriteOn
                  ? t("overwrite_warning" as any, lang)
                  : /* @ts-expect-error dynamic key */
                    t(descKey, lang)}
              </p>
            </div>
            <ToggleSwitch
              checked={settings[key]}
              onChange={() => toggle(key)}
              variant={isOverwrite ? "danger" : "default"}
            />
          </div>
        );
      })}
    </div>
  );
}
