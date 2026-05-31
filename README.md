# markdown-converter

Convert common office documents and files to Markdown.

## Supported formats

- `.txt` / `.md`
- `.docx`
- `.xlsx`
- `.pdf`
- `.pptx`

## Install

```bash
pip install -e .
```

---

## CLI usage

Convert a single file:

```bash
mdconvert report.docx -o output
```

Batch convert a directory:

```bash
mdconvert ./docs -o ./markdown --recursive
```

Export image assets:

```bash
mdconvert report.docx -o output --assets
```

### CLI options

| Option | Description |
| --- | --- |
| `-o, --output <dir>` | Output directory (default: `./output`) |
| `--recursive` | Recursively convert files in a directory |
| `--assets` | Export image assets to an assets folder |
| `--no-overwrite` | Do not overwrite existing output files |

---

## GUI usage

Launch the graphical interface:

```bash
mdconvert-gui          # Single language
mdconvert-gui-i18n     # Bilingual (中文 / English)
```

### 双语版功能 (mdconvert-gui-i18n)

- **中英文界面** — 右上角下拉框切换语言，默认跟随系统语言
- **拖拽支持** — 直接拖入文件或文件夹
- **配置记忆** — 自动记住上次的输出目录和语言偏好
- **桌面快捷方式** — 一键生成 (Windows `.lnk` / macOS `.command` / Linux `.desktop`)
- **异步转换** — 后台线程处理，界面不会卡顿

### 快捷键

| 快捷键 | 功能 |
| --- | --- |
| Ctrl+O | 选择文件 |
| Ctrl+D | 选择文件夹 |
| Ctrl+S | 开始转换 |
| Ctrl+L | 切换语言 |

### 配置文件

用户配置保存在 `~/.markdown_converter/config.json`，内容包括：

```json
{
  "language": "zh",
  "output_dir": "C:/Users/xxx/output"
}
```

---

## Web frontend

A React + TypeScript + Vite + Tailwind CSS frontend is in the `web/` directory.

### Architecture

```
┌─────────────────┐     /api proxy     ┌──────────────────┐
│  Vite Dev Server │  ───────────────>  │  FastAPI Backend  │
│  localhost:5173  │                    │  localhost:8000   │
└─────────────────┘                    └──────────────────┘
        │                                        │
        │ React SPA                              │ MarkdownConvertService
        │ Tailwind CSS                           │ ConvertOptions
        │ lucide-react icons                     │ ConverterRegistry
        │ Bilingual i18n                         │ Temporary file storage
```

### Backend startup

```bash
# Install Python dependencies first
pip install -e .

# Start the FastAPI server
uvicorn markdown_converter.web_api:app --reload --port 8000

# Or use the CLI entry point
mdconvert-web
```

The API will be available at `http://localhost:8000`.

Verify it's running:

```bash
curl http://localhost:8000/api/health
# {"status":"ok"}
```

### Frontend startup

```bash
cd web
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` requests to the FastAPI backend at `http://localhost:8000`.

### Build for production

```bash
cd web
npm run build     # outputs to dist/
```

### Features

- **Drag & drop file upload** — supports `.txt`, `.md`, `.docx`, `.xlsx`, `.pdf`, `.pptx`
- **Multi-file batch conversion** — upload and convert multiple files at once
- **Real-time conversion progress** — polling-based progress bar with live log
- **Markdown preview modal** — view converted Markdown source in-app
- **Download results** — single `.md` files or bundled `.zip`
- **Bilingual UI (中文 / English)** — auto-detects browser language, saves to localStorage
- **Responsive layout** — desktop two-column, mobile stacked
- **Dark code log panel** — terminal-style conversion log with color-coded entries
- **Mock mode** — toggle `USE_MOCK` in `src/lib/api.ts` to test frontend without backend

### API endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/convert` | Upload files and start conversion |
| `GET` | `/api/jobs/{job_id}` | Poll job status, progress, results |
| `GET` | `/api/preview/{result_id}` | Get Markdown content |
| `GET` | `/api/download/{result_id}` | Download a result file |

#### POST /api/convert

- Content-Type: `multipart/form-data`
- Fields:
  - `files` (File[]) — uploaded files
  - `export_assets` (bool) — export image assets
  - `overwrite` (bool) — overwrite existing files
  - `zip_output` (bool) — bundle results as ZIP
  - `language` ("zh" | "en") — UI language hint

Returns: `{"job_id": "...", "status": "queued"}`

#### GET /api/jobs/{job_id}

Returns:

```json
{
  "job_id": "abc123",
  "status": "running",
  "progress": 50,
  "current_file": "report.docx",
  "logs": ["Starting conversion...", "Converting report.docx..."],
  "results": [
    {
      "id": "xyz789",
      "file_name": "report.md",
      "download_url": "/api/download/xyz789",
      "preview_url": "/api/preview/xyz789"
    }
  ],
  "zip_result": null,
  "error": null
}
```

Job statuses: `queued` → `running` → `success` | `failed`

---

## Troubleshooting

### 页面空白 (Blank page)

1. **Check browser Console (F12)** — look for red errors
2. **Verify `index.html`** — must contain `<div id="root"></div>`
3. **Verify `main.tsx`** — must call `ReactDOM.createRoot(document.getElementById("root")!).render(...)`
4. **Verify `App.tsx`** — must render UI even if API is unavailable
5. **Run `npm install`** — missing `node_modules` is the most common cause
6. **Check Tailwind** — `index.css` must contain `@import "tailwindcss";`

### API requests failing

1. **Check FastAPI is running** — verify with `curl http://localhost:8000/api/health`
2. **Check Vite proxy** — `vite.config.ts` must proxy `/api` to `http://localhost:8000`
3. **CORS issues** — the backend already allows all origins via `CORSMiddleware`
4. **Port conflicts** — ensure nothing else is using ports 5173 or 8000

### Upload failing

1. **Verify `python-multipart` is installed** — `pip install python-multipart`
2. **Check file format** — only `.txt`, `.md`, `.docx`, `.xlsx`, `.pdf`, `.pptx` are supported
3. **Check request** — frontend sends `FormData` with `files` field; check Network tab

### Build errors

1. **TypeScript errors** — run `npx tsc --noEmit` to see type issues
2. **Missing dependencies** — `npm install` to restore `node_modules`
3. **Tailwind not loading** — ensure `@tailwindcss/vite` plugin is in `vite.config.ts`

### Backend startup errors

1. **Module not found** — run `pip install -e .` from project root
2. **Port in use** — use `--port 8001` to change port
3. **Import errors** — check that `src/markdown_converter/web_api.py` exists

---

## Project structure

```
.
├── pyproject.toml
├── README.md
├── src/markdown_converter/        # Python backend
│   ├── cli.py                     # CLI entry (click)
│   ├── gui.py                     # Desktop GUI (single language)
│   ├── gui_multilang.py           # Desktop GUI (中英文双语)
│   ├── web_api.py                 # FastAPI web API
│   ├── config.py                  # ConvertOptions dataclass
│   ├── service.py                 # MarkdownConvertService
│   ├── converter_registry.py      # File type → converter mapping
│   ├── utils.py                   # Helpers (table_to_markdown, etc.)
│   └── converters/
│       ├── base.py                # BaseConverter ABC
│       ├── text_converter.py      # .txt / .md
│       ├── docx_converter.py      # .docx
│       ├── xlsx_converter.py      # .xlsx
│       ├── pdf_converter.py       # .pdf
│       └── pptx_converter.py      # .pptx
├── tests/
│   └── test_utils.py
└── web/                           # React frontend
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── dist/                      # Production build output
    └── src/
        ├── main.tsx               # Entry point
        ├── App.tsx                # Root component
        ├── index.css              # Tailwind import
        ├── types.ts               # Shared TypeScript types
        ├── lib/
        │   ├── api.ts             # API client + mock mode
        │   ├── i18n.ts            # Translations (zh/en)
        │   └── file.ts            # File utilities
        └── components/
            ├── LanguageSwitch.tsx
            ├── FileDropzone.tsx
            ├── FileList.tsx
            ├── ConvertSettings.tsx
            ├── ProgressBar.tsx
            ├── ResultPanel.tsx
            ├── MarkdownPreview.tsx
            ├── LogPanel.tsx
            ├── EmptyState.tsx
            └── StatusBadge.tsx
```
