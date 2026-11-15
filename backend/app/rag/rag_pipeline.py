
from dataclasses import dataclass
from pathlib import Path

from ..model.model import Model
from ..model.schema_router import TaskRouter
from ..schema import *
from .Chunk import Chunk, chunk_text
from .Embedder import Embedder
from .Loader import load
from .VectorDB import VectorDB

@dataclass
class StoredChunk:

    document_id: str
    chunk: Chunk
    embedding: list[float]




class RAGPipeline:

    def __init__(
        self,
        chunk_size: int,
        chunk_overlap: int,
        top_k: int,
        embedding_model: str = "hf.co/CompendiumLabs/bge-base-en-v1.5-gguf:Q4_K_M",
        chunking_mode: str = "basic",
        model_mode: str = "ollama",
    ):

        self.top_k = top_k

        self.chunk_size = chunk_size

        self.chunk_overlap = chunk_overlap

        self.chunking_mode = chunking_mode

        self.model_mode = model_mode

        self.database = VectorDB()

        self.embedder = Embedder(embedding_model)





    def context(self, file_path: str, user_id: int) -> str:

        doc = load(file_path)

        chunks = chunk_text(
            doc, self.chunk_size, self.chunk_overlap, mode=self.chunking_mode
        )

        embeddings = self.embedder.embed_documents([c.text for c in chunks])

        self.database.add(user_id, chunks, embeddings)

        return doc.doc_id


    def provide_context(self, question: str, user_id: int, document_id: str):

        quest_embedding = self.embedder.embed_query(question)

        top_k_embeddings = self.database.sim_search(quest_embedding, self.top_k, document_id, user_id )

        return top_k_embeddings

    def generate_response(
        self,
        prompt: str,
        model: str | Model,
        user_id: int,
        document_id: str,
    ) -> GeneratedNotes | FlashcardDeck | GenericResponse:

        context = None

        schema_type = TaskRouter().classify_and_rewrite_query(prompt)

        if (requires_context(schema_type)):

            retrieved_chunks = self.provide_context(prompt, user_id, document_id)

            context = "\n\n".join(chunk.text for chunk in retrieved_chunks)


        model_instance = (
            Model(mode=self.model_mode, model=model)
            if isinstance(model, str)
            else model
        )

        return model_instance.chat(prompt, context, schema_type)


def main():
    documents = Path(__file__).resolve().parent / "documents"
    pipeline = RAGPipeline(
        chunk_size=900,
        chunk_overlap=120,
        top_k=8,
        model_mode="google-genai",
    )
    model = Model(mode="google-genai", model="gemini-3.8-flash")
    document = documents / "colosseum.txt"
    user_id = 1
    prompts = [
        "Create three flashcards about the Colosseum's construction and history.",
        "Create three flashcards about the Colosseum's architecture and seating.",
        "Create three flashcards about events held at the Colosseum.",
    ]

    document_id = pipeline.context(str(document), user_id=user_id)
    for prompt in prompts:
        print(f"\nPrompt: {prompt}")
        result = pipeline.generate_response(
            prompt=prompt,
            model=model,
            user_id=user_id,
            document_id=document_id
        )
        print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
