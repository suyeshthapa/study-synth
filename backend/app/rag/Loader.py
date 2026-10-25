from pathlib import Path

from .Document import Document


class Loader:
    def load(self, files: list[str | Path]) -> list[Document]:
        ...
