  
from dotenv import load_dotenv
import ollama
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel
from pathlib import Path
from .schema_router import TaskRouter
from ..schema import FlashcardDeck, GeneratedNotes, GenericResponse


PROMPT_INSTRUCTION = {
    FlashcardDeck: (
        "Create high-quality study flashcards from the supplied source passages. "
        "Follow the requested topic and number, but return no more than 10 cards. "
        "Each card must test one important, distinct fact supported by the context. "
        "Use a specific question and a concise, direct answer; avoid duplicate cards "
        "and unsupported details. Preserve uncertainty, use exact dates and names "
        "only when stated, and keep each question and answer under 200 characters. "
        "Include a short exact source excerpt only when useful, otherwise use null. "
        "Return a complete response matching the FlashcardDeck schema."
    ),
    GeneratedNotes: (
        "Create structured study notes that preserve important facts, definitions, "
        "explanations, relationships, and qualifications supported by the context. "
        "Do not add unsupported information or infer details the source does not "
        "establish. Distinguish missing information from information explicitly "
        "stated in the source, remove irrelevant repetition, and follow the "
        "GeneratedNotes schema exactly."
    ),
    GenericResponse: (
        "Answer the user's question or explain the requested topic."
        "Be as factual and accurate as possible without relying on external context."
        "Please do not state that there is no external context to provide. Instead answer the users prompt"
        "to the best of your ability."
    ),
}

ENV_PATH  = Path(__file__).resolve().parents[2]


load_dotenv(ENV_PATH / "api_key.env")

class Model:
    def __init__(self, mode: str, model: str, **kwargs):

        self.mode = mode
        temperature = kwargs.pop("temperature", 0.2)

        if mode == "google-groq":
            self.llm = ChatGroq(model=model, temperature=temperature, **kwargs)
        elif mode == "google-genai":
            self.llm = ChatGoogleGenerativeAI(
                model=model, temperature=temperature, **kwargs
            )
        elif mode == "ollama":
            self.llm = model
        else:
            raise ValueError(
                "mode must be 'google-groq', 'google-genai', or 'ollama'"
            )

    def chat(self, prompt: str, context: str | None, schema_type: BaseModel) -> BaseModel:

        user_dict = {}

        user_dict["role"] = "user"

        if context:

            user_dict["content"] = (
                f"TASK:\n{prompt}\n\n"
                f"Context: {context}"
            )

        else:

            user_dict["content"] = f"TASK:\n{prompt}\n\n"

      
        messages = [
            {
                "role": "system",
                "content": (
                    "Follow the task and output schema exactly. Use only facts "
                    "supported by the supplied retrieved context. Do not use "
                    "outside knowledge, guess, or fill gaps. If a requested fact "
                    "is absent, omit it rather than inventing an answer. "
                    "Specialized Task Instruction: "
                    f"{PROMPT_INSTRUCTION[schema_type]}"
                ),
            },
           user_dict,
        ]

        print("Schema_type is \t", schema_type)

        if self.mode == "google-groq":
            structured_llm = self.llm.with_structured_output(
            schema=schema_type,
            method="json_schema",
            strict=True
            )

            return structured_llm.invoke(messages)

        elif self.mode == "google-genai":
            structured_llm  = self.llm.with_structured_output(
                schema=schema_type
            )

            return structured_llm.invoke(messages)


        response = ollama.chat(
            model=self.llm,
            messages=messages,
            format=schema_type.model_json_schema(),
            options={
                "num_predict": 2000,
                "num_ctx": 8192,
                "temperature": 0.2,
                "top_p": 0.9,
            },
        )
        return schema_type.model_validate_json(response.message.content)
