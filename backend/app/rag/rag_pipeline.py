from dataclasses import dataclass
from Chunk import Chunk

@dataclass
class StoredChunk:

    document_id: str
    chunk: Chunk
    embedding: list[float]




class RAGPipeline:
    ...
