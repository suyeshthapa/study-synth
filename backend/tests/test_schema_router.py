import unittest
from unittest.mock import patch

from app.model.schema_router import (
    FlashcardDeck,
    GeneratedNotes,
    GenericResponse,
    main,
)
from app.model.schema_router import SchemaRouter, TaskRouter


class TaskRouterTests(unittest.TestCase):
    @patch("app.model.schema_router.ChatGoogleGenerativeAI")
    def test_routes_variety_of_prompts(self, chat_google_generative_ai):
        structured_router = (
            chat_google_generative_ai.return_value.with_structured_output.return_value
        )
        prompts_and_schemas = [
            ("Write study notes about photosynthesis.", "GeneratedNotes", GeneratedNotes),
            ("Make flashcards about cell division.", "FlashcardDeck", FlashcardDeck),
            ("What is the difference between mitosis and meiosis?", "Generic_Response", GenericResponse),
            ("Summarize why seasons change.", "Generic_Response", GenericResponse),
        ]
        structured_router.invoke.side_effect = [
            SchemaRouter(schema_type=schema_type)
            for _, schema_type, _ in prompts_and_schemas
        ]

        router = TaskRouter()
        for prompt, _, expected_schema in prompts_and_schemas:
            with self.subTest(prompt=prompt):
                self.assertIs(
                    router.classify_and_rewrite_query(prompt),
                    expected_schema,
                )

        self.assertEqual(structured_router.invoke.call_count, len(prompts_and_schemas))
        for call, (prompt, _, _) in zip(
            structured_router.invoke.call_args_list, prompts_and_schemas
        ):
            self.assertEqual(call.args[0][1]["content"], prompt)

    @patch("app.model.schema_router.ChatGoogleGenerativeAI")
    def test_main_runs_and_returns_selected_schema(self, chat_google_generative_ai):
        structured_router = (
            chat_google_generative_ai.return_value.with_structured_output.return_value
        )
        structured_router.invoke.return_value = SchemaRouter(
            schema_type="Generic_Response"
        )

        with patch("builtins.print") as print_mock:
            selected_schema = main("What is photosynthesis?")

        self.assertIs(selected_schema, GenericResponse)
        print_mock.assert_any_call("Selected schema: GenericResponse")


if __name__ == "__main__":
    unittest.main()
