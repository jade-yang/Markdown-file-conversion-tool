from __future__ import annotations

import sys
import traceback
from pathlib import Path
from typing import List

from PyQt6.QtCore import QThread, pyqtSignal, Qt, QMimeData, QSize
from PyQt6.QtGui import QFont, QDragEnterEvent, QDropEvent, QColor, QPalette
from PyQt6.QtWidgets import (
    QApplication,
    QCheckBox,
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
    QVBoxLayout,
    QWidget,
)

from markdown_converter.config import ConvertOptions
from markdown_converter.converter_registry import SUPPORTED_EXTENSIONS
from markdown_converter.service import MarkdownConvertService


# ---------------------------------------------------------------------------
# Worker thread for conversion
# ---------------------------------------------------------------------------

class ConvertWorker(QThread):
    log = pyqtSignal(str)
    progress = pyqtSignal(int, int)  # current, total
    finished = pyqtSignal(list, list)  # success_paths, errors

    def __init__(self, inputs: List[Path], options: ConvertOptions, parent=None):
        super().__init__(parent)
        self.inputs = inputs
        self.options = options

    def run(self):
        service = MarkdownConvertService()
        success_paths: list[Path] = []
        errors: list[str] = []

        all_files: list[Path] = []
        for inp in self.inputs:
            if inp.is_file():
                if inp.suffix.lower() in SUPPORTED_EXTENSIONS:
                    all_files.append(inp)
                else:
                    errors.append(f"Unsupported file type: {inp.name}")
            elif inp.is_dir():
                found = list(
                    _collect_files(inp, SUPPORTED_EXTENSIONS, self.options.recursive)
                )
                all_files.extend(found)
                if not found:
                    errors.append(f"No supported files found in: {inp}")

        total = len(all_files)
        if total == 0:
            self.log.emit("No files to convert.")
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
                self.log.emit(f"[OK] {source} -> {out_path}")
            except Exception:
                tb = traceback.format_exc().strip()
                msg = f"[ERROR] {source}: {tb}"
                errors.append(msg)
                self.log.emit(msg)

        self.finished.emit(success_paths, errors)


def _collect_files(root: Path, extensions: set[str], recursive: bool):
    pattern = "**/*" if recursive else "*"
    for p in root.glob(pattern):
        if p.is_file() and p.suffix.lower() in extensions:
            yield p


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _apply_style(app: QApplication) -> None:
    app.setStyleSheet("""
        QMainWindow, QWidget {
            background-color: #fafafa;
            font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
            font-size: 13px;
            color: #333;
        }
        QLabel#titleLabel {
            font-size: 22px;
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
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        QFrame#card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
        }
        QPushButton {
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 6px;
            padding: 6px 16px;
            min-height: 28px;
        }
        QPushButton:hover {
            background-color: #e8e8e8;
            border-color: #bbb;
        }
        QPushButton:pressed {
            background-color: #ddd;
        }
        QPushButton#primaryButton {
            background-color: #2563eb;
            color: white;
            border: none;
            font-weight: bold;
            padding: 8px 24px;
            min-height: 32px;
        }
        QPushButton#primaryButton:hover {
            background-color: #1d4ed8;
        }
        QPushButton#primaryButton:pressed {
            background-color: #1e40af;
        }
        QPushButton#primaryButton:disabled {
            background-color: #93b4f5;
            color: #ddd;
        }
        QListWidget {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 4px;
        }
        QListWidget::item {
            padding: 3px 6px;
            border-radius: 4px;
        }
        QListWidget::item:selected {
            background-color: #dbeafe;
            color: #1e40af;
        }
        QPlainTextEdit {
            background: #1e1e1e;
            color: #d4d4d4;
            border: 1px solid #333;
            border-radius: 6px;
            padding: 8px;
            font-family: "Cascadia Code", "Consolas", monospace;
            font-size: 12px;
        }
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
        QCheckBox {
            spacing: 6px;
        }
        QCheckBox::indicator {
            width: 16px;
            height: 16px;
            border: 2px solid #bbb;
            border-radius: 4px;
            background: white;
        }
        QCheckBox::indicator:checked {
            background-color: #2563eb;
            border-color: #2563eb;
        }
    """)


# ---------------------------------------------------------------------------
# Card helper
# ---------------------------------------------------------------------------

def _make_card() -> tuple[QFrame, QVBoxLayout]:
    frame = QFrame()
    frame.setObjectName("card")
    layout = QVBoxLayout(frame)
    layout.setContentsMargins(16, 12, 16, 12)
    layout.setSpacing(8)
    return frame, layout


def _section_label(text: str) -> QLabel:
    label = QLabel(text)
    label.setObjectName("sectionLabel")
    return label


# ---------------------------------------------------------------------------
# Main Window
# ---------------------------------------------------------------------------

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Markdown Converter")
        self.setMinimumSize(760, 520)
        self.resize(760, 560)
        self.setAcceptDrops(True)

        self._input_paths: list[Path] = []
        self._output_dir: Path | None = None
        self._worker: ConvertWorker | None = None

        self._build_ui()

    # -- UI construction ----------------------------------------------------

    def _build_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        root = QVBoxLayout(central)
        root.setContentsMargins(24, 20, 24, 20)
        root.setSpacing(12)

        # Title
        title = QLabel("Markdown Converter")
        title.setObjectName("titleLabel")
        root.addWidget(title)

        subtitle = QLabel("Convert docx / xlsx / pdf / pptx / txt to Markdown")
        subtitle.setObjectName("subtitleLabel")
        root.addWidget(subtitle)

        root.addSpacing(4)

        # --- Input card ----------------------------------------------------
        inp_card, inp_lay = _make_card()
        inp_lay.addWidget(_section_label("INPUT FILES"))

        btn_row = QHBoxLayout()
        btn_row.setSpacing(8)
        self._btn_files = QPushButton("Select Files...")
        self._btn_files.clicked.connect(self._pick_files)
        self._btn_folder = QPushButton("Select Folder...")
        self._btn_folder.clicked.connect(self._pick_folder)
        self._btn_clear = QPushButton("Clear")
        self._btn_clear.clicked.connect(self._clear_inputs)
        btn_row.addWidget(self._btn_files)
        btn_row.addWidget(self._btn_folder)
        btn_row.addWidget(self._btn_clear)
        btn_row.addStretch()
        inp_lay.addLayout(btn_row)

        self._file_list = QListWidget()
        self._file_list.setMaximumHeight(120)
        inp_lay.addWidget(self._file_list)
        root.addWidget(inp_card)

        # --- Output card ---------------------------------------------------
        out_card, out_lay = _make_card()
        out_lay.addWidget(_section_label("OUTPUT DIRECTORY"))

        out_row = QHBoxLayout()
        out_row.setSpacing(8)
        self._btn_output = QPushButton("Choose Output...")
        self._btn_output.clicked.connect(self._pick_output)
        out_row.addWidget(self._btn_output)
        self._output_label = QLabel("Not selected")
        self._output_label.setStyleSheet("color:#999;")
        out_row.addWidget(self._output_label, 1)
        out_lay.addLayout(out_row)
        root.addWidget(out_card)

        # --- Options card --------------------------------------------------
        opt_card, opt_lay = _make_card()
        opt_lay.addWidget(_section_label("OPTIONS"))

        opt_row = QHBoxLayout()
        opt_row.setSpacing(20)
        self._chk_recursive = QCheckBox("Recursive")
        self._chk_assets = QCheckBox("Export assets")
        self._chk_overwrite = QCheckBox("Overwrite existing")
        self._chk_overwrite.setChecked(True)
        opt_row.addWidget(self._chk_recursive)
        opt_row.addWidget(self._chk_assets)
        opt_row.addWidget(self._chk_overwrite)
        opt_row.addStretch()
        opt_lay.addLayout(opt_row)
        root.addWidget(opt_card)

        # --- Action area ---------------------------------------------------
        act_card, act_lay = _make_card()

        self._btn_start = QPushButton("Start Conversion")
        self._btn_start.setObjectName("primaryButton")
        self._btn_start.setMinimumHeight(36)
        self._btn_start.clicked.connect(self._start_conversion)
        act_lay.addWidget(self._btn_start)

        self._progress = QProgressBar()
        self._progress.setValue(0)
        self._progress.setVisible(False)
        act_lay.addWidget(self._progress)
        root.addWidget(act_card)

        # --- Log area ------------------------------------------------------
        log_card, log_lay = _make_card()
        log_lay.addWidget(_section_label("LOG"))
        self._log = QPlainTextEdit()
        self._log.setReadOnly(True)
        self._log.setMaximumHeight(140)
        log_lay.addWidget(self._log)
        root.addWidget(log_card, 1)

        # Drag-drop hint
        self._drag_hint = QLabel("Drag and drop files or folders here")
        self._drag_hint.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._drag_hint.setStyleSheet(
            "color:#bbb; font-size:11px; padding:4px;"
        )
        root.addWidget(self._drag_hint)

    # -- File / folder picking ---------------------------------------------

    def _pick_files(self):
        exts = " ".join(f"*{e}" for e in sorted(SUPPORTED_EXTENSIONS))
        filt = f"Supported files ({exts});;All files (*)"
        files, _ = QFileDialog.getOpenFileNames(
            self, "Select Files", "", filt
        )
        if files:
            self._add_inputs([Path(f) for f in files])

    def _pick_folder(self):
        d = QFileDialog.getExistingDirectory(self, "Select Folder")
        if d:
            self._add_inputs([Path(d)])

    def _pick_output(self):
        d = QFileDialog.getExistingDirectory(self, "Choose Output Directory")
        if d:
            self._output_dir = Path(d)
            self._output_label.setText(str(d))
            self._output_label.setStyleSheet("color:#333;")

    def _add_inputs(self, paths: list[Path]):
        for p in paths:
            if p not in self._input_paths:
                self._input_paths.append(p)
                self._file_list.addItem(QListWidgetItem(str(p)))

    def _clear_inputs(self):
        self._input_paths.clear()
        self._file_list.clear()

    # -- Drag & drop -------------------------------------------------------

    def dragEnterEvent(self, event: QDragEnterEvent):
        if event.mimeData().hasUrls():
            event.acceptProposedAction()

    def dropEvent(self, event: QDropEvent):
        paths = [Path(u.toLocalFile()) for u in event.mimeData().urls()]
        self._add_inputs(paths)
        event.acceptProposedAction()

    # -- Conversion --------------------------------------------------------

    def _start_conversion(self):
        if not self._input_paths:
            QMessageBox.warning(self, "No input", "Please select files or a folder first.")
            return
        if self._output_dir is None:
            QMessageBox.warning(self, "No output", "Please choose an output directory.")
            return

        options = ConvertOptions(
            output_dir=self._output_dir,
            export_assets=self._chk_assets.isChecked(),
            recursive=self._chk_recursive.isChecked(),
            overwrite=self._chk_overwrite.isChecked(),
        )

        self._btn_start.setEnabled(False)
        self._progress.setVisible(True)
        self._progress.setValue(0)
        self._log.clear()
        self._log.appendPlainText("Starting conversion...")

        self._worker = ConvertWorker(self._input_paths, options)
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
        self._btn_start.setEnabled(True)
        self._progress.setVisible(False)

        n_ok = len(success)
        n_err = len(errors)
        self._log.appendPlainText(f"\nDone: {n_ok} succeeded, {n_err} failed.")

        if n_ok > 0:
            QMessageBox.information(
                self,
                "Conversion Complete",
                f"Successfully converted {n_ok} file(s).\n"
                f"{n_err} error(s).\n\n"
                f"Output: {self._output_dir}",
            )
        else:
            QMessageBox.warning(
                self,
                "Conversion Failed",
                f"No files were converted.\n{n_err} error(s).\nCheck log for details.",
            )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    app = QApplication(sys.argv)
    _apply_style(app)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
