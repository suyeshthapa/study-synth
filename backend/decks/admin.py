from django.contrib import admin
from .models import Deck, Card


class CardInline(admin.TabularInline):
    model = Card
    extra = 0  # don't show empty "add another" rows by default


@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "card_count", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title", "description", "owner__username")
    inlines = [CardInline]

    @admin.display(description="Cards")
    def card_count(self, obj):
        return obj.cards.count()


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ("front", "deck", "created_at")
    search_fields = ("front", "back", "deck__title", "deck__owner__username")