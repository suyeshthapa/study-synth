import { useState } from "react";
import api from "../api/apiClient";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function GenerateCards({ deckId, onSaved }) {
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(10);
  const [generated, setGenerated] = useState([]); // [{ front, back, selected }]
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedCount = generated.filter((c) => c.selected).length;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setGenerating(true);
    try {
      const res = await api.post(
        `/decks/${deckId}/generate/`,
        { prompt, count: Number(count) },
        { timeout: 60000 } // give the AI up to 60 seconds
      );
      const cards = res.data.cards.map((c) => ({ ...c, selected: true }));
      setGenerated(cards);
      if (cards.length === 0) {
        setError("The AI didn't return any usable cards. Try rewording your prompt.");
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 429) {
        setError("You've reached the hourly limit for AI generation. Please try again later.");
      } else if (status === 400) {
        setError(
          data?.prompt?.join(" ") || data?.count?.join(" ") || "Please check your prompt."
        );
      } else {
        setError(data?.detail || "Couldn't generate cards right now. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const toggle = (index) => {
    setGenerated(
      generated.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c))
    );
  };

  const setAll = (value) => {
    setGenerated(generated.map((c) => ({ ...c, selected: value })));
  };

  const handleSave = async () => {
    const toSave = generated.filter((c) => c.selected);
    if (toSave.length === 0) return;

    setError("");
    setSaving(true);

    const saved = [];
    const failed = [];
    for (const card of toSave) {
      try {
        const res = await api.post("/cards/", {
          deck: Number(deckId),
          front: card.front,
          back: card.back,
        });
        saved.push(res.data);
      } catch (err) {
        failed.push(card);
      }
    }

    if (saved.length > 0) onSaved(saved); // tell the deck page about the new cards

    // keep the cards you didn't pick, plus any that failed to save
    const remaining = generated.filter((c) => !c.selected).concat(failed);
    setGenerated(remaining);

    if (failed.length > 0) {
      setError(
        `${failed.length} card(s) couldn't be saved. They're still in the list, so you can try again.`
      );
    } else if (remaining.length === 0) {
      setPrompt("");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-3 my-8">
      <h2 className="text-lg font-semibold text-gray-900">Generate cards with AI</h2>

      <form onSubmit={handleGenerate} className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a topic, e.g. 'Photosynthesis basics for high school biology'"
          maxLength={500}
          rows={2}
          required
          className={inputClass}
        />

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700" htmlFor="count">
            Cards:
          </label>
          <select
            id="count"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1"
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={generating || saving || !prompt.trim()}
            className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      {generating && (
        <p className="text-sm text-gray-600">This can take a few seconds...</p>
      )}

      {generated.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-xs text-gray-500">
            AI-generated cards can contain mistakes. Review them before saving.
          </p>

          <div className="flex gap-4 text-sm">
            <button
              type="button"
              onClick={() => setAll(true)}
              className="text-blue-600 hover:underline"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setAll(false)}
              className="text-blue-600 hover:underline"
            >
              Select none
            </button>
          </div>

          <ul className="space-y-2">
            {generated.map((card, index) => (
              <li key={index} className="border border-gray-200 rounded-lg p-3">
                <label className="flex gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={card.selected}
                    onChange={() => toggle(index)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium text-gray-900 whitespace-pre-wrap">
                      {card.front}
                    </span>
                    <span className="block text-gray-600 whitespace-pre-wrap">
                      {card.back}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || selectedCount === 0}
              className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : `Save selected (${selectedCount})`}
            </button>
            <button
              type="button"
              onClick={() => setGenerated([])}
              disabled={saving}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}