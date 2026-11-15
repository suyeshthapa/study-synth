from typing import Any

import ollama


class Embedder:
    def __init__(self, model: str) -> None:
        
        self.model = model

    def embed_documents(self, texts: list[str]) -> Any:
        
        return [
            self.embed_query(txt)
            for txt in texts
        ]

    def embed_query(self, text: str) -> Any:
        
        return ollama.embed(model=self.model, input=text).embeddings[0]
