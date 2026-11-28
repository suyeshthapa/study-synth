import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/apiClient";

// return a new array in random order using Fisher-Yates algorithm
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function StudyPage() {
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0); // which card we're on
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [deckRes, cardsRes] = await Promise.all([
          api.get(`/decks/${id}/`),
          api.get(`/cards/?deck=${id}`),
        ]);
        setDeck(deckRes.data);
        setCards(shuffle(cardsRes.data)); // shuffled once when the page opens
      } catch (err) {
        setLoadError(
          err.response?.status === 404
            ? "Deck not found."
            : "Couldn't load this deck. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const goNext = () => {
    setIndex((i) => Math.min(i + 1, cards.length - 1));
    setShowBack(false); // every new card starts on its front
  };

  const goPrev = () => {
    setIndex((i) => Math.max(i - 1, 0));
    setShowBack(false);
  };

  const reshuffle = () => {
    setCards(shuffle(cards));
    setIndex(0);
    setShowBack(false);
  };

  // left and right arrow keys move between cards
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown); // cleanup
  }, [cards.length]);

  if (loading) return <p className="p-8 text-gray-600">Loading...</p>;

  if (loadError) {
    return (
      <div className="p-8">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to decks
        </Link>
        <p className="mt-4 text-red-600">{loadError}</p>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to={`/decks/${id}`} className="text-blue-600 hover:underline">
          ← Back to deck
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Studying: {deck.title}
        </h1>

        {cards.length === 0 ? (
          <p className="mt-6 text-gray-600">
            This deck has no cards yet. Add some on the deck page first.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mt-1">
              Card {index + 1} of {cards.length}
            </p>

            {/* the card that can be clicked to flip */}
            <button
              type="button"
              onClick={() => setShowBack(!showBack)}
              className="w-full mt-6 min-h-[240px] bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center text-center hover:shadow-lg transition"
            >
              <span className="text-xs uppercase tracking-wide text-gray-500">
                {showBack ? "Answer" : "Question"} · click to flip
              </span>
              <span className="mt-3 text-xl text-gray-900 whitespace-pre-wrap">
                {showBack ? card.back : card.front}
              </span>
            </button>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={goPrev}
                disabled={index === 0}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                onClick={reshuffle}
                className="text-blue-600 hover:underline"
              >
                Shuffle again
              </button>

              <button
                onClick={goNext}
                disabled={index === cards.length - 1}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}