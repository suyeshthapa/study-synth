# converts the deck and card models to json objects
# validates incoming json objects and converts them into model objects

from rest_framework import serializers
from .models import Deck, Card

class DeckSerializer(serializers.ModelSerializer):
    card_count = serializers.SerializerMethodField()

    class Meta:
        model = Deck
        fields = ['id', 'title', 'description', 'created_at', 'card_count']
        read_only_fields = ['id', 'created_at']

    def get_card_count(self, obj):
        return obj.cards.count()

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id', 'deck', 'front', 'back', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_deck(self, deck):
        if deck.owner != self.context["request"].user:
            raise serializers.ValidationError("You don't own this deck to make changes to it.")
        return deck