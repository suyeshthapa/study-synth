import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/apiClient";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function Home() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ title: "", description: "" });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");               // what's typed in the box
  const [debouncedSearch, setDebouncedSearch] = useState(""); // what we actually search for
  const [reloadKey, setReloadKey] = useState(0);          // bump this to force a reload
  const navigate = useNavigate();

  // wait 300ms after the user stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer); // typing again cancels the previous timer
  }, [search]);

  // fetch decks on first load, and again whenever the search or reloadKey changes
  useEffect(() => {
    let ignore = false; // protects against slow, out-of-order responses

    const loadDecks = async () => {
      try {
        const res = await api.get("/decks/", {
          params: debouncedSearch ? { search: debouncedSearch } : {},
        });
        if (!ignore) {
          setDecks(res.data);
          setLoadError("");
        }
      } catch (err) {
        if (!ignore) setLoadError("Couldn't load your decks. Please try again.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadDecks();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, reloadKey]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await api.post("/decks/", form);
      setForm({ title: "", description: "" });
      // clear the search and reload, so the new deck is visible
      setSearch("");
      setDebouncedSearch("");
      setReloadKey((k) => k + 1);
    } catch (err) {
      setErrors(err.response?.data || { detail: "Something went wrong." });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My decks</h1>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Log out
          </button>
        </div>

        {/* new deck form */}
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-xl shadow-md space-y-3 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900">New deck</h2>

          {errors.detail && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {errors.detail}
            </p>
          )}

          <input
            name="title"
            placeholder="Deck title"
            value={form.title}
            onChange={handleChange}
            required
            className={inputClass}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.join(" ")}</p>
          )}

          <input
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.join(" ")}</p>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create deck
          </button>
        </form>

        {/* search */}
        <input
          type="search"
          placeholder="Search decks by title or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} mb-6`}
        />

        {/* deck grid */}
        {loading && <p className="text-gray-600">Loading...</p>}
        {loadError && <p className="text-red-600">{loadError}</p>}

        {!loading && !loadError && decks.length === 0 && (
          <p className="text-gray-600">
            {debouncedSearch
              ? `No decks match "${debouncedSearch}".`
              : "No decks yet. Create your first one above!"}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              to={`/decks/${deck.id}`}
              className="block bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-gray-900">{deck.title}</h3>
              {deck.description && (
                <p className="text-sm text-gray-600 mt-1">{deck.description}</p>
              )}
              <p className="text-sm text-blue-600 mt-3">
                {deck.card_count} {deck.card_count === 1 ? "card" : "cards"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}