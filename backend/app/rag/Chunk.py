from dataclasses import dataclass


@dataclass
class Chunk:
    text: str
    document_id: int
    index: int
    document_offset: tuple[int, int]


def chunk_text(
    text:str,
    chunk_size: int,
    chunk_overlap
):

    chunk_list = []

    step_size = chunk_size - chunk_overlap

    for idx, i in enumerate(range(0, len(text), step_size)):

        text_chunk = text[i:i+chunk_size]

        chunk_list.append(Chunk(text_chunk, idx, [i, min(i+chunk_size, len(n))] ))

    return chunk_list

