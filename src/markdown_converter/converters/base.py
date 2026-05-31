from abc import ABC, abstractmethod
from pathlib import Path
from markdown_converter.config import ConvertOptions


class BaseConverter(ABC):
    @abstractmethod
    def convert(self, input_path: Path, options: ConvertOptions) -> str:
        raise NotImplementedError
