from typing import Any

from pathlib import Path

import ollama
from langchain_classic.embeddings import CacheBackedEmbeddings
from langchain_classic.storage import LocalFileStore
from .Document import generate_hash
import chromadb


class Embedder:
    def __init__(self, model: str) -> None:
        
        self.model = model
        self.download_if_needed()

    def download_if_needed(self):
        local_model = [m.model for m in ollama.list().models]

        if (self.model not in local_model
            and f"{self.model}:latest not in local_models"):
            ollama.pull(self.model)

    def embed_documents(self, texts: list[str]) -> Any:
        
        return [
            self.embed_query(txt)
            for txt in texts
        ]

    def embed_query(self, text: str) -> Any:
        
        return ollama.embed(model=self.model, input=text).embeddings[0]



class CachedEmbedder:

    def __init__(self, embedder: Embedder, cache_mode: str = "default"):

        self.cache_mode = cache_mode

        if (self.cache_mode == "LangChain"):
            self.cache_embedder: CacheBackedEmbeddings = CacheBackedEmbeddings.from_bytes_store(
              underlying_embeddings = embedder,
              doument_embedding_cache = LocalFileStore(Path(__file__).resolve().parents[0] / "chroma_data"),
              namespace = "nomic-embed-text",
              key_encoder = "sha256"
            )  

        else:

            self.embedder = embedder

            self.cache = chromadb.PersistentClient(Path(__file__).resolve().parents[0])

    def embed_documents(self, texts: list[str] ):

        if (self.mode == "LangChain"):

            return self.cache_embedder.embed_documents(texts)

        else:

            chunk_cache = self.cache.get_or_create_collection(
                name = "chromadb_chunk_cache"
            )

            embeddings = []

            for txt in texts:

                embedding_hash = generate_hash(txt)

                state = chunk_cache.get(
                    where =  {"chunk_hash":embedding_hash }
                )

                if state["ids"]:
                    
                    continue

                else:

                    embedding = self.embedder.embed_query(txt)

                    embeddings.append(embedding)

            return embeddings


    def embed_query(self, txt: str):

        if self.mode == "LangChain":

            return self.cache_embedder.embed_query(txt)

        else:

            chunk_cache = self.cache.get_or_create_collection(
                            name = "chromadb_chunk_cache"
                        )

            embedding_hash = generate_hash(txt)
            
            state = chunk_cache.get(
                                where =  {"chunk_hash":embedding_hash }
                            )
            
            if state["ids"]:
                                
                return None


            return self.embedder.embed_query(txt)


                









