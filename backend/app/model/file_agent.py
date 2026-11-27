
from pathlib import Path

def loop_through_dir(dir:str|Path):

    path_dir = None

    if isinstance(dir, str):

        path_dir = Path(dir)

    elif isinstance(dir, Path):

        path_dir = dir

    for file in path_dir.rglob("*"):

        if file.is_file():

            yield file#.relative_to(dir)



