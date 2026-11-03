import re
from django.core.exceptions import ValidationError


class ComplexityValidator:
    """Requires at least one number and one symbol."""

    def validate(self, password, user=None):
        errors = []

        if not re.search(r"\d", password):
            errors.append(
                ValidationError(
                    "Password must contain at least one number.",
                    code="password_no_number",
                )
            )

        if not re.search(r"[^A-Za-z0-9\s]", password):
            errors.append(
                ValidationError(
                    "Password must contain at least one symbol.",
                    code="password_no_symbol",
                )
            )

        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return "Your password must contain at least one number and one symbol."