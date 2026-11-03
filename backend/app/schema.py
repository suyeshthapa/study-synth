 
import pydantic
import json

from pydantic import BaseModel, ConfigDict, Field




class NoteSection(BaseModel):
    model_config = ConfigDict(strict = 'True', extra = 'forbid')
    headings: str
    content: str
    key_terms: list[str] = Field(default_factory=list)
    context: str


class GeneratedNotes(BaseModel):
    model_config = ConfigDict(strict = 'True', extra = 'forbid')
    title: str
    sections: list[NoteSection]


class Flashcard(BaseModel):
    model_config = ConfigDict(strict = 'True', extra = 'forbid')
    question: str
    answer: str
    source_excerpt: str | None


class FlashcardDeck(BaseModel):
    model_config = ConfigDict(strict = 'True', extra = 'forbid')
    title: str
    cards: list[Flashcard] = Field(min_length=1)