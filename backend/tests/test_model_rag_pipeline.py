import unittest
from types import SimpleNamespace
from unittest.mock import patch

from app.model.model import Model, PROMPT_INSTRUCTION
from app.rag.rag_pipeline import RAGPipeline
from app.schema import FlashcardDeck, GeneratedNotes, GenericResponse


class ModelTests(unittest.TestCase):
    def test_prompt_instructions_cover_each_supported_schema(self):
        self.assertEqual(
            set(PROMPT_INSTRUCTION),
            {FlashcardDeck, GeneratedNotes, GenericResponse},
        )
        self.assertTrue(all(PROMPT_INSTRUCTION.values()))

    @patch("app.model.model.ollama.chat")
    @patch("app.model.model.TaskRouter")
    def test_ollama_chat_uses_selected_schema_and_context(
        self, task_router, ollama_chat
    ):
        task_router.return_value.classify_and_rewrite_query.return_value = FlashcardDeck
        ollama_chat.return_value = SimpleNamespace(
            message=SimpleNamespace(
                content=(
                    '{"title":"Origins","cards":[{"question":"When was it built?",'
                    '"answer":"In 1800.","source_excerpt":null}]}'
                )
            )
        )

        result = Model(mode="ollama", model="test-model").chat(
            "Create flashcards about its origins.", "Built in 1800."
        )

        self.assertIsInstance(result, FlashcardDeck)
        messages = ollama_chat.call_args.kwargs["messages"]
        self.assertIn(PROMPT_INSTRUCTION[FlashcardDeck], messages[0]["content"])
        self.assertIn("Built in 1800.", messages[1]["content"])


class RAGPipelineTests(unittest.TestCase):
    @patch("app.rag.rag_pipeline.Model")
    @patch("app.rag.rag_pipeline.Embedder")
    @patch("app.rag.rag_pipeline.VectorDB")
    def test_generate_response_uses_model_abstraction(
        self, vector_db, embedder, model_class
    ):
        pipeline = RAGPipeline(chunk_size=100, chunk_overlap=10, top_k=2)
        pipeline.provide_context = lambda prompt, user_id, document_id: [
            SimpleNamespace(text="Retrieved fact.")
        ]
        model_class.return_value.chat.return_value = FlashcardDeck(
            title="Facts",
            cards=[
                {
                    "question": "What fact was retrieved?",
                    "answer": "Retrieved fact.",
                }
            ],
        )

        result = pipeline.generate_response(
            prompt="About the topic",
            model="test-model",
            user_id=1,
            document_id="doc-1",
            response_type="flashcards",
        )

        self.assertIsInstance(result, FlashcardDeck)
        model_class.assert_called_once_with(mode="ollama", model="test-model")
        model_class.return_value.chat.assert_called_once_with(
            "Create flashcards.\nAbout the topic",
            "Retrieved fact.",
        )

    @patch("app.rag.rag_pipeline.Model")
    @patch("app.rag.rag_pipeline.Embedder")
    @patch("app.rag.rag_pipeline.VectorDB")
    def test_generate_response_reuses_supplied_model_instance(
        self, vector_db, embedder, model_class
    ):
        pipeline = RAGPipeline(chunk_size=100, chunk_overlap=10, top_k=2)
        pipeline.provide_context = lambda prompt, user_id, document_id: []
        model = unittest.mock.Mock()
        model.chat.return_value = GenericResponse(txt="Answer")

        result = pipeline.generate_response(
            prompt="Question",
            model=model,
            user_id=1,
            document_id="doc-1",
        )

        self.assertIs(result, model.chat.return_value)
        model.chat.assert_called_once_with(
            "Create structured study notes.\nQuestion",
            "",
        )
        model_class.assert_not_called()

    @patch("app.rag.rag_pipeline.Model")
    @patch("app.rag.rag_pipeline.Embedder")
    @patch("app.rag.rag_pipeline.VectorDB")
    def test_generate_response_rejects_unknown_response_type(
        self, vector_db, embedder, model_class
    ):
        pipeline = RAGPipeline(chunk_size=100, chunk_overlap=10, top_k=2)

        with self.assertRaisesRegex(ValueError, "response_type"):
            pipeline.generate_response(
                prompt="Question",
                model="test-model",
                user_id=1,
                document_id="doc-1",
                response_type="unknown",
            )

        model_class.assert_not_called()


if __name__ == "__main__":
    unittest.main()
