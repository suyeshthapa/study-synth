import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/apiClient";

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
const errorClass = "text-sm text-red-600";

export default function DeckPage() {
  const { id } = useParams(); // the :id from the URL (/decks/3)
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState({}); // { 1: true } means card 1 shows its back
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // form to add card
  const [form, setForm] = useState({ front: "", back: "" });
  const [errors, setErrors] = useState({});

  // edit deck from
  const [editingDeck, setEditingDeck] = useState(false);
  const [deckForm, setDeckForm] = useState({ title: "", description: "" });
  const [deckErrors, setDeckErrors] = useState({});

  // edit card form
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardForm, setCardForm] = useState({ front: "", back: "" });
  const [cardErrors, setCardErrors] = useState({});

  // load the deck and its cards when the page opens or id changes
  useEffect(() => {
    const load = async () => {
      try {
        const [deckRes, cardsRes] = await Promise.all([
          api.get(`/decks/${id}/`),
          api.get(`/cards/?deck=${id}`),
        ]);
        setDeck(deckRes.data);
        setCards(cardsRes.data);
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

  // add card
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const res = await api.post("/cards/", { deck: Number(id), ...form });
      setCards([...cards, res.data]); // new cards go at the end
      setForm({ front: "", back: "" });
    } catch (err) {
      setErrors(err.response?.data || { detail: "Something went wrong." });
    }
  };

  // edit deck
  const startEditDeck = () => {
    setDeckForm({ title: deck.title, description: deck.description });
    setDeckErrors({});
    setEditingDeck(true);
  };

  const handleDeckChange = (e) => {
    setDeckForm({ ...deckForm, [e.target.name]: e.target.value });
  };

  const handleSaveDeck = async (e) => {
    e.preventDefault();
    setDeckErrors({});
    try {
      // patch sends only the fields we include and leaves the rest alone
      const res = await api.patch(`/decks/${id}/`, deckForm);
      setDeck(res.data);
      setEditingDeck(false);
    } catch (err) {
      setDeckErrors(err.response?.data || { detail: "Something went wrong." });
    }
  };

  // delete deck
  const handleDeleteDeck = async () => {
    const ok = window.confirm(
      `Delete "${deck.title}" and its ${cards.length} card(s)? This can't be undone.`
    );
    if (!ok) return;
    try {
      await api.delete(`/decks/${id}/`);
      navigate("/"); // the deck is gone, so go back to the list
    } catch (err) {
      setDeckErrors({ detail: "Couldn't delete the deck. Please try again." });
    }
  };

  // edit card
  const startEditCard = (card) => {
    setEditingCardId(card.id);
    setCardForm({ front: card.front, back: card.back });
    setCardErrors({});
  };

  const handleCardChange = (e) => {
    setCardForm({ ...cardForm, [e.target.name]: e.target.value });
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    setCardErrors({});
    try {
      const res = await api.patch(`/cards/${editingCardId}/`, cardForm);
      // swap the updated card into the list, keep the others as they are
      setCards(cards.map((c) => (c.id === editingCardId ? res.data : c)));
      setEditingCardId(null);
    } catch (err) {
      setCardErrors(err.response?.data || { detail: "Something went wrong." });
    }
  };

  // delete card
  const handleDelete = async (cardId) => {
    if (!window.confirm("Delete this card?")) return;
    try {
      await api.delete(`/cards/${cardId}/`);
      setCards(cards.filter((card) => card.id !== cardId));
    } catch (err) {
      setErrors({ detail: "Couldn't delete the card. Please try again." });
    }
  };

  const toggleFlip = (cardId) => {
    setFlipped({ ...flipped, [cardId]: !flipped[cardId] });
  };

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to decks
        </Link>

        {/* deck header: normal view or edit form */}
        {deckErrors.detail && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {deckErrors.detail}
          </p>
        )}

        {editingDeck ? (
          <form
            onSubmit={handleSaveDeck}
            className="bg-white p-6 rounded-xl shadow-md space-y-3 mt-4"
          >
            <h2 className="text-lg font-semibold text-gray-900">Edit deck</h2>

            <input
              name="title"
              value={deckForm.title}
              onChange={handleDeckChange}
              required
              className={inputClass}
            />
            {deckErrors.title && (
              <p className={errorClass}>{deckErrors.title.join(" ")}</p>
            )}

            <input
              name="description"
              placeholder="Description (optional)"
              value={deckForm.description}
              onChange={handleDeckChange}
              className={inputClass}
            />
            {deckErrors.description && (
              <p className={errorClass}>{deckErrors.description.join(" ")}</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingDeck(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{deck.title}</h1>
              {deck.description && (
                <p className="text-gray-600 mt-1">{deck.description}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {cards.length > 0 ? (
                <Link
                  to={`/decks/${id}/study`}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                >
                  Study
                </Link>
              ) : (
                <span className="bg-gray-200 text-gray-500 px-3 py-2 rounded-lg cursor-not-allowed">
                  Study
                </span>
              )}
              <button
                onClick={startEditDeck}
                className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300"
              >
                Edit deck
              </button>
              <button
                onClick={handleDeleteDeck}
                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
              >
                Delete deck
              </button>
            </div>
          </div>
        )}

        {/* add card form */}
        <form
          onSubmit={handleAdd}
          className="bg-white p-6 rounded-xl shadow-md space-y-3 my-8"
        >
          <h2 className="text-lg font-semibold text-gray-900">Add a card</h2>

          {errors.detail && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {errors.detail}
            </p>
          )}
          {errors.deck && (
            <p className={errorClass}>{errors.deck.join(" ")}</p>
          )}

          <textarea
            name="front"
            placeholder="Front (question)"
            value={form.front}
            onChange={handleChange}
            required
            rows={2}
            className={inputClass}
          />
          {errors.front && (
            <p className={errorClass}>{errors.front.join(" ")}</p>
          )}

          <textarea
            name="back"
            placeholder="Back (answer)"
            value={form.back}
            onChange={handleChange}
            required
            rows={2}
            className={inputClass}
          />
          {errors.back && (
            <p className={errorClass}>{errors.back.join(" ")}</p>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add card
          </button>
        </form>

        {/* Cards */}
        {cards.length === 0 && (
          <p className="text-gray-600">No cards yet. Add your first one above!</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => {
            // this card is being edited, so show a form instead of the flip view
            if (editingCardId === card.id) {
              return (
                <form
                  key={card.id}
                  onSubmit={handleSaveCard}
                  className="bg-white rounded-xl shadow-md p-5 space-y-3"
                >
                  {cardErrors.detail && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {cardErrors.detail}
                    </p>
                  )}

                  <textarea
                    name="front"
                    value={cardForm.front}
                    onChange={handleCardChange}
                    required
                    rows={2}
                    className={inputClass}
                  />
                  {cardErrors.front && (
                    <p className={errorClass}>{cardErrors.front.join(" ")}</p>
                  )}

                  <textarea
                    name="back"
                    value={cardForm.back}
                    onChange={handleCardChange}
                    required
                    rows={2}
                    className={inputClass}
                  />
                  {cardErrors.back && (
                    <p className={errorClass}>{cardErrors.back.join(" ")}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCardId(null)}
                      className="bg-gray-200 text-gray-800 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              );
            }

            // normal view with click to flip, plus edit and delete
            const showBack = flipped[card.id];
            return (
              <div key={card.id} className="bg-white rounded-xl shadow-md p-5">
                <button
                  type="button"
                  onClick={() => toggleFlip(card.id)}
                  className="w-full text-left min-h-[80px]"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {showBack ? "Back" : "Front"} · click to flip
                  </p>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                    {showBack ? card.back : card.front}
                  </p>
                </button>
                <div className="mt-3 flex gap-4 text-sm">
                  <button
                    type="button"
                    onClick={() => startEditCard(card)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(card.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}