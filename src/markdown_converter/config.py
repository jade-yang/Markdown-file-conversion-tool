from dataclasses import dataclass
from pathlib import Path


@dataclass
class ConvertOptions:
    output_dir: Path
    export_assets: bool = False
    recursive: bool = False
    overwrite: bool = False
