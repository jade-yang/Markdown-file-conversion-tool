from pathlib import Path
from markdown_converter.config import ConvertOptions
from markdown_converter.converter_registry import SUPPORTED_EXTENSIONS, get_converter
from markdown_converter.utils import ensure_output_dir, iter_supported_files, write_markdown


class MarkdownConvertService:
    def convert_path(self, input_path: Path, options: ConvertOptions) -> list[Path]:
        input_path = input_path.expanduser().resolve()
        output_dir = options.output_dir.expanduser().resolve()
        ensure_output_dir(output_dir)

        outputs: list[Path] = []
        for source in iter_supported_files(input_path, SUPPORTED_EXTENSIONS, options.recursive):
            output_path = output_dir / f"{source.stem}.md"
            markdown = self.convert_file(source, options)
            write_markdown(markdown, output_path, overwrite=options.overwrite)
            outputs.append(output_path)

        if not outputs:
            raise FileNotFoundError(f"No supported files found in: {input_path}")

        return outputs

    def convert_file(self, input_path: Path, options: ConvertOptions) -> str:
        converter = get_converter(input_path)
        return converter.convert(input_path, options)
