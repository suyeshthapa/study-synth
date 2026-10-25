from typing import Any

import ollama


class Embedder:
    def __init__(self, model: str) -> None:
        ...

    def embed_document(self, text: str) -> Any:
        ...

    def embed_query(self, text: str) -> Any:
        ...
