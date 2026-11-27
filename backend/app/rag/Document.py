from dataclasses import dataclass, field
import hashlib

@dataclass
class Document:
    text: str
    file_name: str
    title: str
    doc_id: str #= field(default_factory = lambda: uuid4().hex)

def generate_hash(text:str) -> str:

    return hashlib.sha256(
        text.encode("utf-8")
    ).hexdigest()