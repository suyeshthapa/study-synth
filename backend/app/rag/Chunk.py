
from dataclasses import dataclass, asdict
from .Document import *
from langchain_text_splitters import RecursiveCharacterTextSplitter




@dataclass
class Chunk:
    text: str
    index: int
    chunk_hash: int
    document_offset: tuple[int, int]
    document_metadata: dict[str, str]



def chunk_text(
    doc:Document,
    chunk_size: int,
    chunk_overlap: int,
    mode: str = "basic"
):

    text = doc.text

    doc_metadata = asdict(doc)

    doc_metadata.pop("text")

    chunk_list = []

    step_size = chunk_size - chunk_overlap

    if (mode == "basic"):

        for idx, i in enumerate(range(0, len(text), step_size)):

            text_chunk = text[i:i+chunk_size]

            chunk_list.append(
            Chunk(
                text=text_chunk,
                index=idx,
                chunk_hash = generate_hash(text_chunk),
                document_offset=(i, min(i + chunk_size, len(text))),
                document_metadata = doc_metadata
            )
        )

    else:

        chunker  = RecursiveCharacterTextSplitter(
            chunk_size = chunk_size,
            chunk_overlap = chunk_overlap, 
            length_function = len, 
            add_start_index = True, 
            strip_whitespace = True
        )

        chunk_documents = chunker.create_documents([text])

        

        for ch_idx, chunk in enumerate(chunk_documents):

            start = chunk.metadata["start_index"
                            ]

            end = start + len(chunk.page_content)


            chunk_list.append(
            Chunk(
                    text=chunk,
                    index=ch_idx,
                    chunk_hash = generate_hash(chunk),
                    document_offset=(start,end),
                    document_metadata = doc_metadata
                ))


    return chunk_list
