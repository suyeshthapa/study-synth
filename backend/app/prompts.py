 
import pydantic
from schema import GeneratedNotes, FlashcardDeck
from ollama import chat


def generate_prompts(system_instruction: str, prompt: str, context: str, Schema: type[BaseModel], model):

    response = chat(model = model,
        messages = [
        
        
            {"role" : "system" ,
             " content ": (
                 "Follow the user's instructions precisely."
                 "Retrieve the necessary information precisely"
                 "Do not invent any information to fill gaps. Notify the the user about anything you could not find"
                 f"Specialized Task Instruction: {system_instruction}"
             ) }
        ,
        {
            "role":"user",
            "content": (
                f"TASK:\n{prompt}"
                f"Context: {context if context is not None else "No context provided."}"
            )
        }

        ], format = Schema.model_json_schema()

    )

    return Schema.model_validate_json(response.message.content)
    




def generate_flashcard(model, prompts, context):

    return generate_prompts( model = model,
        system_instruction = """
        "You are a flashcard-generation assistant. "
            "Create accurate, useful study flashcards based on the supplied "
            "task and context. Focus on the most important concepts, facts, "
            "definitions, relationships, and processes. "
            "Each card should test one main idea. "
            "Write a clear, concise question or prompt on the front and "
            "a correct, self-contained answer on the back. "
            "Avoid duplicate cards, vague questions, and unsupported claims. "
            "Do not introduce information that is absent from the context "
            "unless the task explicitly requests outside knowledge. "
            "Follow the FlashcardDeck schema exactly."
            """, prompt = prompts , context = context , Schema =  FlashcardDeck
    )



def generate_note_summary(model, prompts, context):

    return generate_prompts(model = model,
            system_instruction = """
         "You are a structured note-taking and context-extraction assistant. "
            "Preserve important facts, definitions, explanations, relationships, "
            "and qualifications in the notes summary. Do not add unsupported information or infer "
            "details that the source does not establish. "
            "Distinguish missing information from information explicitly stated "
            "in the source. Remove irrelevant repetition while preserving "
            "important meaning. Follow the GeneratedNotes schema exactly."
        """, prompt = prompts , context = context , Schema =  GeneratedNotes
    )