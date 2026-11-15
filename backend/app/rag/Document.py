from dataclasses import dataclass, field
from uuid import uuid4

@dataclass
class Document:
    text: str
    file_name: str
    title: str
    doc_id: str = field(default_factory = lambda: uuid4().hex)