from pathlib import Path
import fitz  # PyMuPDF
import pdfplumber
from markdown_converter.config import ConvertOptions
from markdown_converter.converters.base import BaseConverter
from markdown_converter.utils import normalize_text, table_to_markdown


class PdfConverter(BaseConverter):
    def convert(self, input_path: Path, options: ConvertOptions) -> str:
        parts: list[str] = []

        text = self._extract_text_with_pymupdf(input_path)
        if text:
            parts.append(text)

        tables = self._extract_tables_with_pdfplumber(input_path)
        if tables:
            parts.append("# Tables")
            parts.extend(tables)

        return normalize_text("\n\n".join(parts))

    def _extract_text_with_pymupdf(self, input_path: Path) -> str:
        doc = fitz.open(str(input_path))
        pages: list[str] = []
        for index, page in enumerate(doc, start=1):
            page_text = page.get_text("text").strip()
            if page_text:
                pages.append(f"## Page {index}\n\n{page_text}")
        return "\n\n".join(pages)

    def _extract_tables_with_pdfplumber(self, input_path: Path) -> list[str]:
        results: list[str] = []
        with pdfplumber.open(str(input_path)) as pdf:
            for page_index, page in enumerate(pdf.pages, start=1):
                for table_index, table in enumerate(page.extract_tables() or [], start=1):
                    table_md = table_to_markdown(table)
                    if table_md:
                        results.append(f"## Page {page_index}, Table {table_index}\n\n{table_md}")
        return results
