from pathlib import Path
from markdown_converter.converters.base import BaseConverter
from markdown_converter.converters.text_converter import TextConverter
from markdown_converter.converters.docx_converter import DocxConverter
from markdown_converter.converters.xlsx_converter import XlsxConverter
from markdown_converter.converters.pdf_converter import PdfConverter
from markdown_converter.converters.pptx_converter import PptxConverter


CONVERTERS: dict[str, BaseConverter] = {
    ".txt": TextConverter(),
    ".md": TextConverter(),
    ".docx": DocxConverter(),
    ".xlsx": XlsxConverter(),
    ".pdf": PdfConverter(),
    ".pptx": PptxConverter(),
}

SUPPORTED_EXTENSIONS = set(CONVERTERS.keys())


def get_converter(input_path: Path) -> BaseConverter:
    ext = input_path.suffix.lower()
    try:
        return CONVERTERS[ext]
    except KeyError as exc:
        supported = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise ValueError(f"Unsupported file type: {ext}. Supported: {supported}") from exc
