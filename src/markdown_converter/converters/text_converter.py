from pathlib import Path
from markdown_converter.config import ConvertOptions
from markdown_converter.converters.base import BaseConverter
from markdown_converter.utils import normalize_text


class TextConverter(BaseConverter):
    def convert(self, input_path: Path, options: ConvertOptions) -> str:
        return normalize_text(input_path.read_text(encoding="utf-8", errors="replace"))
