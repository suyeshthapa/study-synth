from rest_framework import viewsets 
from rest_framework.permissions import IsAuthenticated

from .models import Deck, Card
from .serializers import DeckSerializer, CardSerializer

class DeckViewSet(viewsets.ModelViewSet): # provides automatic CRUD operations for decks
    serializer_class = DeckSerializer # use deck serializer to convert deck objects to json and vice versa
    permission_classes = [IsAuthenticated]

    def get_queryset(self): # controls which database records a user can access, in this case only decks that belong to the current user
        return Deck.objects.filter(owner=self.request.user)

    def perform_create(self, serializer): # runs when a new deck is created only
        serializer.save(owner=self.request.user) # ensures users aren't able to create decks for other users

class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Card.objects.filter(deck__owner=self.request.user) # get all cards that belong to decks owned by the current user
        deck_id = self.request.query_params.get('deck') # gets the deck id from the query parameters in the request (e.g. retrieve 1 from /api/cards/?deck=1)
        if deck_id: # if there is a deck id in the query parameters, filter the queryset to only include cards that belong to that deck
            queryset = queryset.filter(deck_id=deck_id)
        return queryset


