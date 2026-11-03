from pathlib import Path

import pypdf
from docx import WordDocument
from .Document import Document



def load_files(files: list[str | Path]) -> list[str]:

    search_root = Path(__file__).resolve().parents[2]

    lines = []

    for file_path in files:

        file_loc = search_root.rglob(file_path)

        for path in file_loc:
            
            if path.is_file():

                text = extract_text(path)

                if text.strip():
                
                    lines.append(text)
    return lines

def load(file_path) -> str:
    return load_files([file_path])[0]
        


def extract_text(file_path_obj: Path):

    file_suffix = file_path_obj.suffix().lower()

    if file_suffix == ".pdf":

        pdf = pypdf.PdfReader(file_path_obj)

        return "\n\n".join([page.get_text() for page in pdf]).strip()


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
    












        
