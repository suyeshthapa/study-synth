from .Chunk import Chunk
from .Document import Document


class Chunker:
    def split(self, document: Document) -> list[Chunk]:
        ...
