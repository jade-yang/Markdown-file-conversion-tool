"""
gui_multilang.py — Markdown Converter 双语桌面界面 (PyQt6)

功能:
  - 中英文动态切换
  - 拖拽文件/文件夹
  - 快捷键: Ctrl+O / Ctrl+D / Ctrl+S / Ctrl+L
  - 配置持久化 (语言 + 输出目录)
  - 异步转换 (QThread)
  - 桌面快捷方式生成
"""

from __future__ import annotations

import json
import locale
import os
import platform
import subprocess
import sys
import traceback
from pathlib import Path
from typing import List

from PyQt6.QtCore import QThread, pyqtSignal, Qt, QUrl
from PyQt6.QtGui import QDragEnterEvent, QDropEvent, QKeySequence, QAction, QShortcut
from PyQt6.QtWidgets import (
    QApplication,
    QCheckBox,
    QComboBox,
    QFileDialog,
    QFrame,
    QHBoxLayout,
    QLabel,
    QListWidget,
    QListWidgetItem,
    QMainWindow,
    QMessageBox,
    QPlainTextEdit,
    QProgressBar,
    QPushButton,
    QSplitter,
    QVBoxLayout,
    QWidget,
)

from markdown_converter.config import ConvertOptions
from markdown_converter.converter_registry import SUPPORTED_EXTENSIONS
from markdown_converter.service import MarkdownConvertService


# ============================================================================
# 配置持久化
# ============================================================================

CONFIG_DIR = Path.home() / ".markdown_converter"
CONFIG_FILE = CONFIG_DIR / "config.json"


def _load_config() -> dict:
    """从 ~/.markdown_converter/config.json 读取用户配置"""
    if CONFIG_FILE.exists():
        try:
            return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def _save_config(cfg: dict) -> None:
    """保存用户配置到 JSON 文件"""
    try:
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        CONFIG_FILE.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")
    except OSError:
        pass


def _detect_system_lang() -> str:
    """检测系统语言，返回 'zh' 或 'en'"""
    try:
        lang = locale.getlocale()[0] or ""
        if lang.startswith("zh"):
            return "zh"
    except Exception:
        pass
    return "en"


# ============================================================================
# 双语文本表
# ============================================================================

T: dict[str, dict[str, str]] = {
    # --- 窗口 / 标题 ---
    "window_title":        {"en": "Markdown Converter",                    "zh": "Markdown 转换器"},
    "subtitle":            {"en": "Convert docx / xlsx / pdf / pptx / txt to Markdown",
                            "zh": "将 docx / xlsx / pdf / pptx / txt 转换为 Markdown"},

    # --- 区域标题 ---
    "sec_input":           {"en": "INPUT FILES",                           "zh": "输入文件"},
    "sec_output":          {"en": "OUTPUT DIRECTORY",                      "zh": "输出目录"},
    "sec_options":         {"en": "OPTIONS",                               "zh": "选项"},
    "sec_log":             {"en": "LOG",                                   "zh": "日志"},

    # --- 按钮 ---
    "btn_select_files":    {"en": "Select Files...",                       "zh": "选择文件…"},
    "btn_select_folder":   {"en": "Select Folder...",                      "zh": "选择文件夹…"},
    "btn_clear":           {"en": "Clear",                                 "zh": "清空"},
    "btn_output":          {"en": "Choose Output...",                      "zh": "选择输出目录…"},
    "btn_start":           {"en": "Start Conversion",                     "zh": "开始转换"},
    "btn_shortcut":        {"en": "Create Desktop Shortcut",              "zh": "创建桌面快捷方式"},

    # --- 选项 ---
    "chk_recursive":       {"en": "Recursive",                            "zh": "递归转换"},
    "chk_assets":          {"en": "Export assets",                         "zh": "导出资源"},
    "chk_overwrite":       {"en": "Overwrite existing",                    "zh": "覆盖已有文件"},

    # --- 占位 / 提示 ---
    "output_not_selected": {"en": "Not selected",                          "zh": "未选择"},
    "drag_hint":           {"en": "Drag and drop files or folders here",   "zh": "拖拽文件或文件夹到此处"},

    # --- 日志消息 ---
    "log_starting":        {"en": "Starting conversion...",                "zh": "开始转换…"},
    "log_done":            {"en": "Done: {ok} succeeded, {err} failed.",   "zh": "完成：成功 {ok} 个，失败 {err} 个。"},
    "log_no_files":        {"en": "No files to convert.",                  "zh": "没有可转换的文件。"},
    "log_unsupported":     {"en": "Unsupported file type: {name}",         "zh": "不支持的文件类型：{name}"},
    "log_no_found":        {"en": "No supported files found in: {path}",   "zh": "未找到支持的文件：{path}"},
    "log_ok":              {"en": "[OK] {src} -> {dst}",                   "zh": "[成功] {src} -> {dst}"},

    # --- 对话框 ---
    "msg_no_input_title":  {"en": "No input",                              "zh": "未选择输入"},
    "msg_no_input":        {"en": "Please select files or a folder first.","zh": "请先选择文件或文件夹。"},
    "msg_no_output_title": {"en": "No output",                             "zh": "未选择输出"},
    "msg_no_output":       {"en": "Please choose an output directory.",    "zh": "请选择输出目录。"},
    "msg_done_title":      {"en": "Conversion Complete",                   "zh": "转换完成"},
    "msg_done":            {"en": "Successfully converted {n} file(s).\nOutput: {dir}",
                            "zh": "成功转换 {n} 个文件。\n输出目录：{dir}"},
    "msg_failed_title":    {"en": "Conversion Failed",                     "zh": "转换失败"},
    "msg_failed":          {"en": "No files were converted.\nCheck log for details.",
                            "zh": "没有文件被转换。\n请查看日志了解详情。"},
    "msg_shortcut_ok":     {"en": "Desktop shortcut created.",             "zh": "桌面快捷方式已创建。"},
    "msg_shortcut_fail":   {"en": "Failed to create shortcut: {err}",      "zh": "创建快捷方式失败：{err}"},

    # --- 语言标签 ---
    "lang_label":          {"en": "Language:",                             "zh": "语言："},
    "lang_en":             {"en": "English",                               "zh": "English"},
    "lang_zh":             {"en": "中文",                                   "zh": "中文"},

    # --- 文件对话框 ---
    "dlg_select_files":    {"en": "Select Files",                          "zh": "选择文件"},
    "dlg_select_folder":   {"en": "Select Folder",                         "zh": "选择文件夹"},
    "dlg_choose_output":   {"en": "Choose Output Directory",               "zh": "选择输出目录"},
}


def tr(key: str, lang: str = "en", **kwargs) -> str:
    """根据 key 和语言返回翻译文本，支持 {name} 格式化"""
    text = T.get(key, {}).get(lang, T.get(key, {}).get("en", key))
    if kwargs:
        try:
            text = text.format(**kwargs)
        except (KeyError, IndexError):
            pass
    return text


# ============================================================================
# 异步转换线程
# ============================================================================

class ConvertWorker(QThread):
    """后台线程执行文件转换，通过信号与主线程通信"""
    log = pyqtSignal(str)           # 单条日志
    progress = pyqtSignal(int, int)  # current, total
    finished = pyqtSignal(list, list)  # success_paths, errors

    def __init__(self, inputs: List[Path], options: ConvertOptions,
                 lang: str = "en", parent=None):
        super().__init__(parent)
        self.inputs = inputs
        self.options = options
        self.lang = lang

    def run(self):
        service = MarkdownConvertService()
        success_paths: list[Path] = []
        errors: list[str] = []

        # 收集所有待转换文件
        all_files: list[Path] = []
        for inp in self.inputs:
            if inp.is_file():
                if inp.suffix.lower() in SUPPORTED_EXTENSIONS:
                    all_files.append(inp)
                else:
                    msg = tr("log_unsupported", self.lang, name=inp.name)
                    errors.append(msg)
                    self.log.emit(msg)
            elif inp.is_dir():
                found = list(_collect_files(inp, SUPPORTED_EXTENSIONS, self.options.recursive))
                all_files.extend(found)
                if not found:
                    msg = tr("log_no_found", self.lang, path=str(inp))
                    errors.append(msg)
                    self.log.emit(msg)

        total = len(all_files)
        if total == 0:
            self.log.emit(tr("log_no_files", self.lang))
            self.finished.emit([], errors)
            return

        for i, source in enumerate(all_files, start=1):
            self.progress.emit(i, total)
            try:
                md = service.convert_file(source, self.options)
                out_path = self.options.output_dir / f"{source.stem}.md"
                from markdown_converter.utils import write_markdown
                write_markdown(md, out_path, overwrite=self.options.overwrite)
                success_paths.append(out_path)
                self.log.emit(tr("log_ok", self.lang, src=str(source), dst=str(out_path)))
            except Exception:
                tb = traceback.format_exc().strip()
                err_msg = f"[ERROR] {source}\n{tb}"
                errors.append(err_msg)
                self.log.emit(err_msg)

        self.finished.emit(success_paths, errors)


def _collect_files(root: Path, extensions: set[str], recursive: bool):
    """递归或平铺收集目录下所有支持格式的文件"""
    pattern = "**/*" if recursive else "*"
    for p in root.glob(pattern):
        if p.is_file() and p.suffix.lower() in extensions:
            yield p


# ============================================================================
# 桌面快捷方式创建
# ============================================================================

def create_desktop_shortcut() -> str | None:
    """
    根据当前操作系统创建桌面快捷方式:
      - Windows: .lnk (通过 PowerShell)
      - macOS:   .app 启动器
      - Linux:   .desktop 文件
    成功返回 None，失败返回错误信息。
    """
    system = platform.system()
    desktop = Path.home() / "Desktop"
    if not desktop.exists():
        desktop = Path.home()

    # 定位 python 解释器和 mdconvert-gui 入口
    python = sys.executable

    if system == "Windows":
        return _create_windows_shortcut(desktop, python)
    elif system == "Darwin":
        return _create_macos_shortcut(desktop, python)
    else:
        return _create_linux_shortcut(desktop, python)


def _create_windows_shortcut(desktop: Path, python: str) -> str | None:
    """用 PowerShell 创建 .lnk 快捷方式"""
    lnk_path = desktop / "Markdown Converter.lnk"
    # 使用 pythonw 避免弹出控制台窗口
    pythonw = python.replace("python.exe", "pythonw.exe")
    if not Path(pythonw).exists():
        pythonw = python

    ps_script = f"""
$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut('{lnk_path}')
$sc.TargetPath = '{pythonw}'
$sc.Arguments = '-m markdown_converter.gui_multilang'
$sc.WorkingDirectory = '{Path.home()}'
$sc.Description = 'Markdown Converter'
$sc.Save()
"""
    try:
        subprocess.run(
            ["powershell", "-NoProfile", "-Command", ps_script],
            capture_output=True, text=True, check=True,
        )
        return None
    except Exception as e:
        return str(e)


def _create_macos_shortcut(desktop: Path, python: str) -> str | None:
    """在 macOS 上创建 .command 启动脚本"""
    script_path = desktop / "Markdown Converter.command"
    try:
        script_path.write_text(
            f'#!/bin/bash\n"{python}" -m markdown_converter.gui_multilang\n',
            encoding="utf-8",
        )
        script_path.chmod(0o755)
        return None
    except Exception as e:
        return str(e)


def _create_linux_shortcut(desktop: Path, python: str) -> str | None:
    """在 Linux 上创建 .desktop 文件"""
    desktop_file = desktop / "markdown-converter.desktop"
    content = f"""[Desktop Entry]
Type=Application
Name=Markdown Converter
Comment=Convert documents to Markdown
Exec={python} -m markdown_converter.gui_multilang
Terminal=false
Categories=Utility;
"""
    try:
        desktop_file.write_text(content, encoding="utf-8")
        desktop_file.chmod(0o755)
        return None
    except Exception as e:
        return str(e)


# ============================================================================
# QSS 样式表
# ============================================================================

STYLESHEET = """
/* ---- 全局 ---- */
QMainWindow, QWidget {
    background-color: #fafafa;
    font-family: "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif;
    font-size: 13px;
    color: #333;
}

/* ---- 标题 ---- */
QLabel#titleLabel {
    font-size: 24px;
    font-weight: bold;
    color: #1a1a1a;
}
QLabel#subtitleLabel {
    font-size: 12px;
    color: #888;
}
QLabel#sectionLabel {
    font-size: 11px;
    font-weight: bold;
    color: #666;
    letter-spacing: 1px;
}

/* ---- 卡片 ---- */
QFrame#card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
}

/* ---- 普通按钮 ---- */
QPushButton {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 6px 16px;
    min-height: 28px;
}
QPushButton:hover   { background-color: #e8e8e8; border-color: #bbb; }
QPushButton:pressed { background-color: #ddd; }

/* ---- 主按钮 (蓝色) ---- */
QPushButton#primaryButton {
    background-color: #2563eb;
    color: white;
    border: none;
    font-weight: bold;
    padding: 8px 24px;
    min-height: 36px;
}
QPushButton#primaryButton:hover   { background-color: #1d4ed8; }
QPushButton#primaryButton:pressed { background-color: #1e40af; }
QPushButton#primaryButton:disabled {
    background-color: #93b4f5;
    color: #e0e0e0;
}

/* ---- 次要按钮 (绿色，快捷方式) ---- */
QPushButton#secondaryButton {
    background-color: #059669;
    color: white;
    border: none;
    padding: 6px 14px;
}
QPushButton#secondaryButton:hover   { background-color: #047857; }
QPushButton#secondaryButton:pressed { background-color: #065f46; }

/* ---- 列表 ---- */
QListWidget {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 4px;
}
QListWidget::item { padding: 3px 6px; border-radius: 4px; }
QListWidget::item:selected { background-color: #dbeafe; color: #1e40af; }

/* ---- 日志 (等宽字体，深色背景) ---- */
QPlainTextEdit {
    background: #1e1e1e;
    color: #d4d4d4;
    border: 1px solid #333;
    border-radius: 6px;
    padding: 8px;
    font-family: "Cascadia Code", "Consolas", "Courier New", monospace;
    font-size: 12px;
}

/* ---- 进度条 ---- */
QProgressBar {
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #eee;
    height: 20px;
    text-align: center;
}
QProgressBar::chunk {
    background-color: #2563eb;
    border-radius: 3px;
}

/* ---- 复选框 ---- */
QCheckBox { spacing: 6px; }
QCheckBox::indicator {
    width: 16px; height: 16px;
    border: 2px solid #bbb;
    border-radius: 4px;
    background: white;
}
QCheckBox::indicator:checked {
    background-color: #2563eb;
    border-color: #2563eb;
}

/* ---- 下拉框 ---- */
QComboBox {
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 4px 8px;
    background: white;
    min-height: 26px;
}
QComboBox::drop-down {
    border: none;
    width: 24px;
}
"""


# ============================================================================
# 卡片 / 辅助
# ============================================================================

def _make_card() -> tuple[QFrame, QVBoxLayout]:
    """创建白色圆角卡片 Frame 和其内部 layout"""
    frame = QFrame()
    frame.setObjectName("card")
    lay = QVBoxLayout(frame)
    lay.setContentsMargins(16, 12, 16, 12)
    lay.setSpacing(8)
    return frame, lay


def _section_label(text: str) -> QLabel:
    lbl = QLabel(text)
    lbl.setObjectName("sectionLabel")
    return lbl


# ============================================================================
# 主窗口
# ============================================================================

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        # --- 加载持久化配置 ---
        self._cfg = _load_config()
        self._lang: str = self._cfg.get("language", _detect_system_lang())

        # --- 状态 ---
        self._input_paths: list[Path] = []
        raw_out = self._cfg.get("output_dir", "")
        self._output_dir: Path | None = Path(raw_out) if raw_out else None
        self._worker: ConvertWorker | None = None

        # --- UI ---
        self._build_ui()
        self._setup_shortcuts()
        self._retranslate()

        self.setAcceptDrops(True)

    # ==================================================================
    # UI 搭建
    # ==================================================================

    def _build_ui(self):
        self.setWindowTitle("Markdown Converter")
        self.setMinimumSize(780, 540)
        self.resize(780, 600)

        central = QWidget()
        self.setCentralWidget(central)
        root = QVBoxLayout(central)
        root.setContentsMargins(24, 20, 24, 20)
        root.setSpacing(10)

        # ---- 顶栏：标题 + 语言切换 ----
        top_row = QHBoxLayout()

        title_col = QVBoxLayout()
        title_col.setSpacing(2)
        self._titleLabel = QLabel()
        self._titleLabel.setObjectName("titleLabel")
        title_col.addWidget(self._titleLabel)

        self._subtitleLabel = QLabel()
        self._subtitleLabel.setObjectName("subtitleLabel")
        title_col.addWidget(self._subtitleLabel)
        top_row.addLayout(title_col)

        top_row.addStretch()

        # 语言切换
        lang_lay = QHBoxLayout()
        lang_lay.setSpacing(6)
        self._langLabel = QLabel()
        lang_lay.addWidget(self._langLabel)

        self._langCombo = QComboBox()
        self._langCombo.addItem("English", "en")
        self._langCombo.addItem("中文", "zh")
        # 设置当前语言
        idx = 1 if self._lang == "zh" else 0
        self._langCombo.setCurrentIndex(idx)
        self._langCombo.currentIndexChanged.connect(self._on_lang_changed)
        lang_lay.addWidget(self._langCombo)
        top_row.addLayout(lang_lay)

        root.addLayout(top_row)
        root.addSpacing(4)

        # ---- 输入卡片 ----
        self._inpCard, inp_lay = _make_card()
        self._secInput = _section_label("")
        inp_lay.addWidget(self._secInput)

        btn_row = QHBoxLayout()
        btn_row.setSpacing(8)
        self._btnFiles = QPushButton()
        self._btnFiles.clicked.connect(self._pick_files)
        self._btnFolder = QPushButton()
        self._btnFolder.clicked.connect(self._pick_folder)
        self._btnClear = QPushButton()
        self._btnClear.clicked.connect(self._clear_inputs)
        btn_row.addWidget(self._btnFiles)
        btn_row.addWidget(self._btnFolder)
        btn_row.addWidget(self._btnClear)
        btn_row.addStretch()
        inp_lay.addLayout(btn_row)

        self._fileList = QListWidget()
        self._fileList.setMaximumHeight(110)
        inp_lay.addWidget(self._fileList)
        root.addWidget(self._inpCard)

        # ---- 输出卡片 ----
        self._outCard, out_lay = _make_card()
        self._secOutput = _section_label("")
        out_lay.addWidget(self._secOutput)

        out_row = QHBoxLayout()
        out_row.setSpacing(8)
        self._btnOutput = QPushButton()
        self._btnOutput.clicked.connect(self._pick_output)
        out_row.addWidget(self._btnOutput)
        self._outputLabel = QLabel()
        out_row.addWidget(self._outputLabel, 1)
        out_lay.addLayout(out_row)
        root.addWidget(self._outCard)

        # 如果已有保存的输出目录，显示它
        if self._output_dir:
            self._outputLabel.setText(str(self._output_dir))
            self._outputLabel.setStyleSheet("color:#333;")

        # ---- 选项卡片 ----
        self._optCard, opt_lay = _make_card()
        self._secOptions = _section_label("")
        opt_lay.addWidget(self._secOptions)

        opt_row = QHBoxLayout()
        opt_row.setSpacing(20)
        self._chkRecursive = QCheckBox()
        self._chkAssets = QCheckBox()
        self._chkOverwrite = QCheckBox()
        self._chkOverwrite.setChecked(True)
        opt_row.addWidget(self._chkRecursive)
        opt_row.addWidget(self._chkAssets)
        opt_row.addWidget(self._chkOverwrite)
        opt_row.addStretch()

        # 快捷方式按钮
        self._btnShortcut = QPushButton()
        self._btnShortcut.setObjectName("secondaryButton")
        self._btnShortcut.clicked.connect(self._create_shortcut)
        opt_row.addWidget(self._btnShortcut)

        opt_lay.addLayout(opt_row)
        root.addWidget(self._optCard)

        # ---- 操作卡片 ----
        self._actCard, act_lay = _make_card()
        self._btnStart = QPushButton()
        self._btnStart.setObjectName("primaryButton")
        self._btnStart.setMinimumHeight(38)
        self._btnStart.clicked.connect(self._start_conversion)
        act_lay.addWidget(self._btnStart)

        self._progress = QProgressBar()
        self._progress.setValue(0)
        self._progress.setVisible(False)
        act_lay.addWidget(self._progress)
        root.addWidget(self._actCard)

        # ---- 日志卡片 (可拉伸) ----
        self._logCard, log_lay = _make_card()
        self._secLog = _section_label("")
        log_lay.addWidget(self._secLog)
        self._log = QPlainTextEdit()
        self._log.setReadOnly(True)
        log_lay.addWidget(self._log, 1)
        root.addWidget(self._logCard, 1)  # stretch=1 让日志区占据剩余空间

        # ---- 拖拽提示 ----
        self._dragHint = QLabel()
        self._dragHint.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._dragHint.setStyleSheet("color:#bbb; font-size:11px; padding:2px;")
        root.addWidget(self._dragHint)

    # ==================================================================
    # 快捷键
    # ==================================================================

    def _setup_shortcuts(self):
        """注册全局快捷键"""
        QShortcut(QKeySequence("Ctrl+O"), self, self._pick_files)
        QShortcut(QKeySequence("Ctrl+D"), self, self._pick_folder)
        QShortcut(QKeySequence("Ctrl+S"), self, self._start_conversion)
        QShortcut(QKeySequence("Ctrl+L"), self, self._toggle_lang)

    def _toggle_lang(self):
        """Ctrl+L 切换语言"""
        new_idx = 1 if self._langCombo.currentIndex() == 0 else 0
        self._langCombo.setCurrentIndex(new_idx)

    # ==================================================================
    # 语言切换
    # ==================================================================

    def _on_lang_changed(self, index: int):
        lang = self._langCombo.itemData(index)
        if lang and lang != self._lang:
            self._lang = lang
            self._retranslate()
            # 持久化
            self._cfg["language"] = lang
            _save_config(self._cfg)

    def _retranslate(self):
        """用当前语言刷新所有文字控件"""
        L = self._lang

        self.setWindowTitle(tr("window_title", L))
        self._titleLabel.setText(tr("window_title", L))
        self._subtitleLabel.setText(tr("subtitle", L))

        self._secInput.setText(tr("sec_input", L))
        self._btnFiles.setText(tr("btn_select_files", L))
        self._btnFolder.setText(tr("btn_select_folder", L))
        self._btnClear.setText(tr("btn_clear", L))

        self._secOutput.setText(tr("sec_output", L))
        self._btnOutput.setText(tr("btn_output", L))
        if self._output_dir is None:
            self._outputLabel.setText(tr("output_not_selected", L))
            self._outputLabel.setStyleSheet("color:#999;")

        self._secOptions.setText(tr("sec_options", L))
        self._chkRecursive.setText(tr("chk_recursive", L))
        self._chkAssets.setText(tr("chk_assets", L))
        self._chkOverwrite.setText(tr("chk_overwrite", L))
        self._btnShortcut.setText(tr("btn_shortcut", L))

        self._btnStart.setText(tr("btn_start", L))
        self._secLog.setText(tr("sec_log", L))
        self._dragHint.setText(tr("drag_hint", L))

        self._langLabel.setText(tr("lang_label", L))

    # ==================================================================
    # 文件 / 文件夹 选择
    # ==================================================================

    def _pick_files(self):
        exts = " ".join(f"*{e}" for e in sorted(SUPPORTED_EXTENSIONS))
        filt = f"Supported files ({exts});;All files (*)"
        files, _ = QFileDialog.getOpenFileNames(
            self, tr("dlg_select_files", self._lang), "", filt
        )
        if files:
            self._add_inputs([Path(f) for f in files])

    def _pick_folder(self):
        d = QFileDialog.getExistingDirectory(self, tr("dlg_select_folder", self._lang))
        if d:
            self._add_inputs([Path(d)])

    def _pick_output(self):
        d = QFileDialog.getExistingDirectory(self, tr("dlg_choose_output", self._lang))
        if d:
            self._output_dir = Path(d)
            self._outputLabel.setText(d)
            self._outputLabel.setStyleSheet("color:#333;")
            # 持久化输出目录
            self._cfg["output_dir"] = d
            _save_config(self._cfg)

    def _add_inputs(self, paths: list[Path]):
        for p in paths:
            if p not in self._input_paths:
                self._input_paths.append(p)
                self._fileList.addItem(QListWidgetItem(str(p)))

    def _clear_inputs(self):
        self._input_paths.clear()
        self._fileList.clear()

    # ==================================================================
    # 拖拽
    # ==================================================================

    def dragEnterEvent(self, event: QDragEnterEvent):
        if event.mimeData().hasUrls():
            event.acceptProposedAction()

    def dropEvent(self, event: QDropEvent):
        paths = [Path(u.toLocalFile()) for u in event.mimeData().urls()]
        self._add_inputs(paths)
        event.acceptProposedAction()

    # ==================================================================
    # 转换
    # ==================================================================

    def _start_conversion(self):
        if not self._input_paths:
            QMessageBox.warning(
                self,
                tr("msg_no_input_title", self._lang),
                tr("msg_no_input", self._lang),
            )
            return
        if self._output_dir is None:
            QMessageBox.warning(
                self,
                tr("msg_no_output_title", self._lang),
                tr("msg_no_output", self._lang),
            )
            return

        options = ConvertOptions(
            output_dir=self._output_dir,
            export_assets=self._chkAssets.isChecked(),
            recursive=self._chkRecursive.isChecked(),
            overwrite=self._chkOverwrite.isChecked(),
        )

        self._btnStart.setEnabled(False)
        self._progress.setVisible(True)
        self._progress.setValue(0)
        self._log.clear()
        self._log.appendPlainText(tr("log_starting", self._lang))

        self._worker = ConvertWorker(self._input_paths, options, lang=self._lang)
        self._worker.log.connect(self._on_log)
        self._worker.progress.connect(self._on_progress)
        self._worker.finished.connect(self._on_finished)
        self._worker.start()

    def _on_log(self, msg: str):
        self._log.appendPlainText(msg)

    def _on_progress(self, current: int, total: int):
        self._progress.setMaximum(total)
        self._progress.setValue(current)

    def _on_finished(self, success: list[Path], errors: list[str]):
        self._btnStart.setEnabled(True)
        self._progress.setVisible(False)

        n_ok = len(success)
        n_err = len(errors)
        self._log.appendPlainText("")
        self._log.appendPlainText(tr("log_done", self._lang, ok=n_ok, err=n_err))

        if n_ok > 0:
            QMessageBox.information(
                self,
                tr("msg_done_title", self._lang),
                tr("msg_done", self._lang, n=n_ok, dir=str(self._output_dir)),
            )
        else:
            QMessageBox.warning(
                self,
                tr("msg_failed_title", self._lang),
                tr("msg_failed", self._lang),
            )

    # ==================================================================
    # 桌面快捷方式
    # ==================================================================

    def _create_shortcut(self):
        err = create_desktop_shortcut()
        if err is None:
            QMessageBox.information(
                self, "OK", tr("msg_shortcut_ok", self._lang)
            )
        else:
            QMessageBox.warning(
                self, "Error", tr("msg_shortcut_fail", self._lang, err=err)
            )


# ============================================================================
# 入口
# ============================================================================

def main():
    app = QApplication(sys.argv)
    app.setStyleSheet(STYLESHEET)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
