from dataclasses import dataclass


@dataclass
class Chunk:
    text: str
    index: int
    document_offset: tuple[int, int]
