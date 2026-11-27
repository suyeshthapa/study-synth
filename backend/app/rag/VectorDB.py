
import chromadb

from chromadb.config import Settings

from chromadb import DEFAULT_TENANT, ClientAPI

from pathlib import Path

from .Embedder import Embedder

from .Chunk import *



from dataclasses import dataclass

import os

@dataclass
class sim_scores:

    text: str

    score: float

    chunk_index: int

    begin_offset: int

    end_offset: int

    file_name: str

    title: str

    doc_id: str



    


CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")

CHROMA_PORT = int(os.getenv("CHROMA_PORT", 8000))

print(CHROMA_HOST, CHROMA_PORT)

class VectorDB:

    def __init__(self, db_path = str(Path(__file__).resolve().parent / "chroma_data") , mode : str = "Debug"  ):

        """

        self.db_path = Path(db_path)

        self.db_path.mkdir(exist_ok = True)

        """

        self.mode = mode

        self.db_path = db_path

        if (mode == "Debug"):
            self.__ch_client: ClientAPI = chromadb.PersistentClient(
            path= db_path
        )

        else:

            self.__ch_client: ClientAPI = chromadb.HttpClient(
                host = CHROMA_HOST, port = CHROMA_PORT
            )

    
    def get_or_create_db_for_user(self, user_id):

        if self.mode == "Debug":

            collection_name = f"db_{user_id}_documents"



        elif (self.mode == "Cloud"):

            dbse = f"db:{user_id}"

            self.__ch_client.get_or_create_database(
            name = dbse,
            tenant = DEFAULT_TENANT 
            )

            self.__ch_client.set_database(dbse)

            collection_name = "documents"

        

        collection = self.__ch_client.get_or_create_collection(
            name = collection_name
        )

        return collection


    def add(self, user_id: str, chunks: list[Chunk], embeddings: list[list[float]]):

        collection = self.get_or_create_db_for_user(user_id)

        ids = [f"{c.document_metadata.get('doc_id')}:{c.index}" for c in chunks]

        docs = [c.text for c in chunks]


        metadatas = [

            {
                "chunk_hash": c.chunk_hash,
                "chunk_index": c.index,
                "begin_offset": c.document_offset[0],
                "end_offset": c.document_offset[1],
                **c.document_metadata
            }

            for c in chunks

        ]

        collection.add(
            ids = ids,
            documents = docs,
            embeddings = embeddings,  
            metadatas = metadatas
        )


    def sim_search(self, embedding: list[float], top_k: int, doc_id: str, user_id):

        results = self.get_or_create_db_for_user(user_id)

        query_info = results.query(query_embeddings = [embedding], n_results = top_k, where = {"doc_id": doc_id}  )

        sim_lst = []

        for doc, dist, metadata in zip(query_info["documents"][0], query_info["distances"][0], query_info["metadatas"][0]):

            metadata.pop("chunk_hash")

            sim_lst.append( sim_scores(doc, score = float(dist), **metadata) )


        return sim_lst



def main():

    # Initialize components
    vector_db = VectorDB()
    embedder = Embedder()

    # Sample document
    text = """
    Python is a high-level programming language.
    It is widely used in machine learning and artificial intelligence.

    Vector databases store embeddings and allow similarity searches.
    ChromaDB is a popular vector database.

    Ollama allows developers to run language models locally.
    It also provides embedding models for semantic search.
    """

    # Chunk document
    chunks = chunk_text(
        text=text,
        chunk_size=100,
        chunk_overlap=20
    )

    print(f"Generated {len(chunks)} chunks")

    # Generate embeddings
    embeddings = embedder.embed_document(
        [chunk.text for chunk in chunks]
    )

    print(f"Generated {len(embeddings)} embeddings")

    # Insert into ChromaDB
    vector_db.add(
        user_id="test_user",
        chunks=chunks,
        embeddings=embeddings,
        document_id="test_document"
    )

    print("Successfully inserted chunks into ChromaDB!")

    # Test query embedding
    query = "What is ChromaDB?"

    query_embedding = embedder.embed_query(query)

    print(f"Query embedding dimensions: {len(query_embedding)}")


if __name__ == "__main__":
    main()
