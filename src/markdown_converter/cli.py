from pathlib import Path
import click
from markdown_converter.config import ConvertOptions
from markdown_converter.service import MarkdownConvertService


@click.command(context_settings={"help_option_names": ["-h", "--help"]})
@click.argument("input_path", type=click.Path(exists=True, path_type=Path))
@click.option("-o", "--output", "output_dir", type=click.Path(path_type=Path), default=Path("./output"), help="输出目录")
@click.option("--recursive", is_flag=True, help="递归转换目录中的文件")
@click.option("--assets", "export_assets", is_flag=True, help="导出图片等资源到 assets 目录，当前为预留接口")
@click.option("--no-overwrite", is_flag=True, help="不覆盖已有输出文件")
def main(input_path: Path, output_dir: Path, recursive: bool, export_assets: bool, no_overwrite: bool):
    """Convert documents and files to Markdown."""
    options = ConvertOptions(
        output_dir=output_dir,
        export_assets=export_assets,
        recursive=recursive,
        overwrite=not no_overwrite,
    )

    service = MarkdownConvertService()
    try:
        outputs = service.convert_path(input_path, options)
    except Exception as exc:
        raise click.ClickException(str(exc)) from exc

    for output in outputs:
        click.echo(f"Generated: {output}")


if __name__ == "__main__":
    main()
