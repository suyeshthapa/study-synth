# defines how data is stored in the database

from django.db import models
from django.conf import settings

class Deck(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='decks',
    )
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at'] # newest decks first 

    def __str__(self):
        return self.title

class Card(models.Model):
    deck = models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name='cards',
    )
    front = models.TextField()
    back = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at'] # oldest cards first

    def __str__(self):
        return self.front[:50]