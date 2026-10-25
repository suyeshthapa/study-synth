from dataclasses import dataclass


@dataclass
class Document:
    text: str
    DOC_ID: str
    content: str
    source: str
