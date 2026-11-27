from pathlib import Path

import pypdf
from docx import Document as WordDocument
from .Document import *
from .VectorDB import VectorDB




def load_files(files: list[str | Path], search_root = Path(__file__).resolve().parents[2]) -> list[Document]:

    lines = []

    for file_path in files:
        input_path = Path(file_path).expanduser()
        if input_path.is_file():
            file_loc = [input_path]
        elif input_path.is_absolute():
            file_loc = []
        else:
            file_loc = search_root.rglob(str(file_path))

        for path in file_loc:
            if path.is_file():
                text = extract_text(path)
                stripped_txt = text.strip()

                if stripped_txt:

                    hash = generate_hash(stripped_txt)

                    lines.append(
                        Document(text=stripped_txt, file_name=path.name, title=path.stem, doc_id = generate_hash(stripped_txt) )
                    )
    return lines

def load(file_path) -> Document:
    documents = load_files([file_path])
    if not documents:
        raise FileNotFoundError(f"No readable document found at: {file_path}")
    return documents[0]


def extract_text(file_path_obj: Path):

    file_suffix = file_path_obj.suffix.lower()

    if file_suffix == ".pdf":

        pdf = pypdf.PdfReader(file_path_obj)

        return "\n\n".join(page.get_text().strip() for page in pdf if page.get_text().strip())


    elif file_suffix == ".docx":

        doc = WordDocument(file_path_obj)

        return "\n\n".join([
            para.text.strip() for para in doc.paragraphs if para.text.strip()
        ])

    elif file_suffix in {".txt", ".md"}:

        with open(file_path_obj, mode = 'r', encoding = 'utf-8',) as file:

            lst = []

            for line in file:

                q = line.strip()

                if (q):

                    lst.append(q)

            return "\n\n".join(lst)

    else:

        raise RuntimeError("Unsupported file type. Please only upload files ending in .pdf, .txt, .docx, or .md")
    












        
