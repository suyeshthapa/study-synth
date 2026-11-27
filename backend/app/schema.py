import pydantic
import json

from pydantic import BaseModel, ConfigDict, Field, model_validator

from typing import Literal

class SchemaRouter(BaseModel):

    schema_type: (Literal["GeneratedNotes", 
                        "FlashcardDeck",
                        "Generic_Response"] ) = Field(description = "The schema that best suits a user's query.")



class NoteSection(BaseModel):
    model_config = ConfigDict(strict=True, extra='forbid')
    headings: str = Field(max_length = 20)
    content: str = Field (max_length = 1000)
    key_terms: list[str] = Field(default_factory=list, max_length = 100)
    context: str


class GeneratedNotes(BaseModel):
    model_config = ConfigDict(strict=True, extra='forbid')
    title: str = Field (max_length = 50)
    sections: list[NoteSection] = Field(default_factory = list, max_length = 10)

class GenericResponse(BaseModel):

    txt: str = Field(max_length = 3000)


class Flashcard(BaseModel):
    model_config = ConfigDict(strict=True, extra='forbid')
    question: str = Field(..., max_length=200)
    answer: str = Field(..., max_length=200)
    source_excerpt: str | None = Field(default=None, max_length=300)

    @model_validator(mode="after")
    def limit_total_length(self):
        total = len(self.question) + len(self.answer)
        total += len(self.source_excerpt or "")
        if total > 500:
            raise ValueError("A flashcard's combined text must be at most 500 characters")
        return self


class FlashcardDeck(BaseModel):
    model_config = ConfigDict(strict=True, extra='forbid')
    title: str = Field(max_length=50)
    cards: list[Flashcard] = Field(..., min_length=1, max_length=10)



def requires_context(Schema):

    return Schema == FlashcardDeck or Schema == GeneratedNotes