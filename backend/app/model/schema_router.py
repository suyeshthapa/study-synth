
from langchain_google_genai import ChatGoogleGenerativeAI
from ..schema import *
from dotenv import load_dotenv
from pathlib import Path
import os

TASK_ROUTER = {
    "GeneratedNotes": GeneratedNotes,
    "FlashcardDeck": FlashcardDeck,
    "Generic_Response": GenericResponse,
}

ENV_PATH  = Path(__file__).resolve().parents[2]

SAMPLE_PROMPTS = (
    "Create structured study notes about photosynthesis.",
    "Write revision notes covering the causes of the French Revolution.",
    "Make five flashcards about the phases of mitosis.",
    "Create flashcards to help me learn basic Spanish greetings.",
    "What is the difference between weather and climate?",
    "Explain Newton's first law in simple terms.",
    "Summarize how the water cycle works.",
    "What are three tips for staying focused while studying?",
)


class TaskRouter:

    def __init__(self, **kwargs):

        self.router = ChatGoogleGenerativeAI(model =
                            "gemini-3.5-flash-lite",
                             **kwargs )
        self.router = self.router.with_structured_output(SchemaRouter)


    def classify_and_rewrite_query(self, prompt: str):

        output: BaseModel = self.router.invoke([
            {
                "role":"system",
                "content": """ 
You are a task classification assistant for an educational
            content generation application.

            Your job is to identify which output schema best matches
            the user's requested task.

            Classification rules:
            1. Select exactly one schema type.
            2. Choose the schema that most closely matches the user's
               primary intent.
            3. Use GeneratedNotes for requests to create structured study notes.
            4. Use FlashcardDeck for requests to create flashcards.
            5. Use Generic_Response for questions, explanations, summaries,
               or other requests that do not ask for notes or flashcards.

"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ] )

        return TASK_ROUTER[output.schema_type]


def main(prompt: str = "Create flashcards about photosynthesis."):

    load_dotenv(ENV_PATH / "api_key.env")

    api_key = os.getenv("GOOGLE_API_KEY")
    
    print("GOOGLE_API_KEY loaded:", bool(api_key))

    selected_schema = TaskRouter().classify_and_rewrite_query(prompt)

    print(f"Selected schema: {selected_schema.__name__}")
    
    return selected_schema


if __name__ == "__main__":
    for sample_prompt in SAMPLE_PROMPTS:
        print(f"Prompt: {sample_prompt}")
        main(sample_prompt)
