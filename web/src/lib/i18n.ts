export type Lang = "zh" | "en";

const translations = {
  // ---- Header ----
  title:            { en: "Markdown Converter", zh: "Markdown 转换器" },
  subtitle:         { en: "Convert docx / xlsx / pdf / pptx / txt to Markdown", zh: "将 docx / xlsx / pdf / pptx / txt 转换为 Markdown" },

  // ---- File dropzone ----
  dropzone_title:   { en: "Drag & drop files here", zh: "拖拽文件到此处" },
  dropzone_or:      { en: "or click to select", zh: "或点击选择文件" },
  dropzone_formats: { en: "Supports .txt .md .docx .xlsx .pdf .pptx", zh: "支持 .txt .md .docx .xlsx .pdf .pptx" },

  // ---- File list ----
  file_name:        { en: "File name", zh: "文件名" },
  file_size:        { en: "Size", zh: "大小" },
  file_type:        { en: "Type", zh: "类型" },
  file_status:      { en: "Status", zh: "状态" },
  file_actions:     { en: "Actions", zh: "操作" },
  clear_all:        { en: "Clear all", zh: "清空全部" },
  remove_file:      { en: "Remove", zh: "移除" },

  // ---- Status badges ----
  status_pending:   { en: "Pending", zh: "等待转换" },
  status_converting:{ en: "Converting...", zh: "转换中…" },
  status_success:   { en: "Success", zh: "成功" },
  status_failed:    { en: "Failed", zh: "失败" },
  status_queued:    { en: "Queued", zh: "排队中" },

  // ---- Settings ----
  settings_title:   { en: "Settings", zh: "转换设置" },
  export_assets:    { en: "Export image assets", zh: "导出图片资源" },
  overwrite:        { en: "Overwrite existing files", zh: "覆盖已有文件" },
  zip_output:       { en: "Package all outputs as ZIP", zh: "将所有输出打包为 ZIP" },

  // ---- Actions ----
  start_convert:    { en: "Start Conversion", zh: "开始转换" },
  converting:       { en: "Converting...", zh: "转换中…" },

  // ---- Progress ----
  progress_label:   { en: "Progress", zh: "进度" },
  converting_file:  { en: "Converting: {name}", zh: "正在转换：{name}" },

  // ---- Results ----
  results_title:    { en: "Results", zh: "转换结果" },
  download:         { en: "Download", zh: "下载" },
  preview:          { en: "Preview", zh: "预览" },
  download_zip:     { en: "Download ZIP", zh: "下载 ZIP" },
  no_results:       { en: "No results yet", zh: "暂无结果" },

  // ---- Preview ----
  preview_title:    { en: "Markdown Preview", zh: "Markdown 预览" },
  close:            { en: "Close", zh: "关闭" },
  preview_empty:    { en: "No content to preview", zh: "没有可预览的内容" },

  // ---- Log ----
  log_title:        { en: "Conversion Log", zh: "转换日志" },
  log_empty:        { en: "No logs yet", zh: "暂无日志" },
  log_expand:       { en: "Expand", zh: "展开" },
  log_collapse:     { en: "Collapse", zh: "收起" },
  log_show:         { en: "Show log", zh: "显示日志" },
  log_hide:         { en: "Hide log", zh: "隐藏日志" },

  // ---- Errors ----
  error_no_files:       { en: "Please add files first", zh: "请先添加文件" },
  error_unsupported:    { en: "Unsupported file format: {name}", zh: "不支持的文件格式：{name}" },
  error_convert_failed: { en: "Conversion failed", zh: "转换失败" },
  error_api:            { en: "API request failed", zh: "API 请求失败" },

  // ---- Empty state ----
  empty_title:      { en: "No files added", zh: "尚未添加文件" },
  empty_desc:       { en: "Drag and drop files or click to select", zh: "拖拽文件到此处或点击选择" },

  // ---- Language switch ----
  lang_label:       { en: "Language", zh: "语言" },

  // ---- Header / Backend ----
  subtitle_short:   { en: "Convert office documents into Markdown instantly", zh: "将办公文档快速转换为 Markdown" },
  backend_connected:   { en: "Connected", zh: "已连接" },
  backend_disconnected:{ en: "Disconnected", zh: "未连接" },
  browse_files:     { en: "Browse Files", zh: "选择文件" },

  // ---- Dashboard stats ----
  stats_files:      { en: "Files Selected", zh: "已选择文件" },
  stats_success:    { en: "Completed", zh: "已完成" },
  stats_failed:     { en: "Failed", zh: "转换失败" },
  stats_progress:   { en: "Overall Progress", zh: "总进度" },

  // ---- File queue ----
  file_queue:       { en: "File Queue", zh: "文件队列" },

  // ---- Settings descriptions ----
  export_assets_desc:   { en: "Extract images to an assets folder", zh: "提取图片到 assets 目录" },
  overwrite_desc:       { en: "Replace existing output files", zh: "替换已有的输出文件" },
  overwrite_warning:    { en: "Existing files will be replaced permanently.", zh: "如果目标文件已存在，将直接替换原文件。" },
  overwrite_badge:      { en: "⚠ Destructive", zh: "⚠ 风险操作" },

  // ---- Overwrite confirm dialog ----
  overwrite_confirm_title: { en: "Overwrite Existing Files?", zh: "确认覆盖已有文件？" },
  overwrite_confirm_desc:  { en: "Existing files with the same name will be replaced permanently. This may overwrite previous results.", zh: "转换过程中如果发现同名文件，将直接替换原文件。此操作可能导致原文件丢失。" },
  overwrite_confirm_cancel:{ en: "Cancel", zh: "取消" },
  overwrite_confirm_proceed:{ en: "Continue & Overwrite", zh: "继续覆盖" },
  zip_output_desc:      { en: "Bundle all results into a single ZIP file", zh: "将所有结果打包为单个 ZIP 文件" },

  // ---- Copy ----
  copy:             { en: "Copy", zh: "复制" },
  copied:           { en: "Copied!", zh: "已复制！" },

  // ---- Dropzone drag active ----
  dropzone_active:  { en: "Release to add files", zh: "释放以添加文件" },
};

type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang, vars?: Record<string, string>): string {
  const entry = translations[key];
  const text = entry ? entry[lang] : key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

export function detectLang(): Lang {
  const nav = navigator.language || "";
  if (nav.startsWith("zh")) return "zh";
  return "en";
}

const STORAGE_KEY = "mdconv-lang";

export function loadLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "zh" || saved === "en") return saved;
  return detectLang();
}

export function saveLang(lang: Lang) {
  localStorage.setItem(STORAGE_KEY, lang);
}
