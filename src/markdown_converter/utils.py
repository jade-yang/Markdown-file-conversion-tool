from __future__ import annotations

import re
from pathlib import Path
from typing import Iterable, List, Sequence


def normalize_text(text: str | None) -> str:
    if not text:
        return ""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def escape_md_cell(value: object) -> str:
    text = "" if value is None else str(value)
    text = text.replace("\n", "<br>").replace("|", "\\|")
    return text.strip()


def table_to_markdown(rows: Sequence[Sequence[object]]) -> str:
    cleaned_rows: List[List[str]] = [
        [escape_md_cell(cell) for cell in row]
        for row in rows
        if any(str(cell or "").strip() for cell in row)
    ]

    if not cleaned_rows:
        return ""

    max_cols = max(len(row) for row in cleaned_rows)
    normalized = [row + [""] * (max_cols - len(row)) for row in cleaned_rows]

    header = normalized[0]
    separator = ["---"] * max_cols
    body = normalized[1:]

    lines = [
        "| " + " | ".join(header) + " |",
        "| " + " | ".join(separator) + " |",
    ]

    for row in body:
        lines.append("| " + " | ".join(row) + " |")

    return "\n".join(lines)


def ensure_output_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_markdown(content: str, output_path: Path, overwrite: bool = True) -> Path:
    if output_path.exists() and not overwrite:
        raise FileExistsError(f"Output file already exists: {output_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content.strip() + "\n", encoding="utf-8")
    return output_path


def iter_supported_files(input_path: Path, extensions: set[str], recursive: bool = False) -> Iterable[Path]:
    if input_path.is_file():
        if input_path.suffix.lower() in extensions:
            yield input_path
        return

    pattern = "**/*" if recursive else "*"
    for path in input_path.glob(pattern):
        if path.is_file() and path.suffix.lower() in extensions:
            yield path


def safe_asset_name(source: Path, suffix: str, index: int) -> str:
    stem = re.sub(r"[^a-zA-Z0-9_-]+", "_", source.stem).strip("_") or "asset"
    return f"{stem}_{index}{suffix}"
