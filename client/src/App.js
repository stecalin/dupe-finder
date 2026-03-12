import { useState } from "react";
import SearchBar from "./components/SearchBar";
import DupeCard from "./components/DupeCard";
import DupeModal from "./components/DupeModal";
import "./App.css";

const SUGGESTIONS = [
  "Dyson Airwrap", "Stanley Cup", "Lululemon Leggings",
  "UGG Boots", "Skims Bodysuit", "Golden Goose Sneakers",
  "Acne Studios Scarf", "Bottega Veneta Bag", "Le Creuset",
  "Aritzia Jacket", "Free People Dress", "Dr. Martens"
];

const SORT_OPTIONS = [
  { label: "Relevant", value: "relevant" },
  { label: "Price ↑", value: "price_asc" },
  { label: "Price ↓", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Most Reviewed", value: "reviews" },
];

function App() {
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSort, setActiveSort] = useState("relevant");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedDupe, setSelectedDupe] = useState(null);

  const fetchDupes = async (query) => {
    setLoading(true);
    setActiveQuery(query);
    try {
      const res = await fetch(`http://localhost:5001/api/amazon/search?q=${query}+dupe`);
      const data = await res.json();
      setResults(data);
      setSearched(true);
      setActiveSort("relevant");
    } catch (err) {
      console.error("Error fetching dupes:", err);
    }
    setLoading(false);
  };

  const getSortedResults = () => {
    const sorted = [...results];
    switch (activeSort) {
      case "price_asc": return sorted.sort((a, b) => a.price - b.price);
      case "price_desc": return sorted.sort((a, b) => b.price - a.price);
      case "reviews": return sorted.sort((a, b) => (b.countReview || 0) - (a.countReview || 0));
      case "rating":
        return sorted.sort((a, b) => {
          const rA = parseFloat(a.productRating) || 0;
          const rB = parseFloat(b.productRating) || 0;
          return rB - rA;
        });
      default: return sorted;
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <p className="tagline">✨ luxury looks, budget prices</p>
        <h1 className="title">Dupe Finder</h1>
        <p className="subtitle">Search any luxury item and discover affordable alternatives you'll actually love</p>
        <SearchBar onSearch={fetchDupes} />
        <div className="suggestions-wrapper">
          <div className="suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="suggestion-chip" onClick={() => fetchDupes(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="results-section">
        {searched && !loading && (
          <div className="filters-bar">
            <p className="results-label">
              Showing dupes for <strong>{activeQuery}</strong> · {results.length} results
            </p>
            <div className="filter-group">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`filter-btn ${activeSort === opt.value ? "active" : ""}`}
                  onClick={() => setActiveSort(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {loading && <p className="no-results">Finding dupes... ✨</p>}
        {!loading && searched && results.length === 0 && (
          <p className="no-results">No dupes found — try another search! 🛍️</p>
        )}
        <div className="results-grid">
          {getSortedResults().map((dupe, index) => (
            <DupeCard
              key={index}
              {...dupe}
              onClick={() => setSelectedDupe(dupe)}
            />
          ))}
        </div>
      </main>

      {selectedDupe && (
        <DupeModal
          dupe={selectedDupe}
          onClose={() => setSelectedDupe(null)}
        />
      )}
    </div>
  );
}

export default App;