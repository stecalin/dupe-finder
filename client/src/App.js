import { useState, useRef, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import DupeCard from "./components/DupeCard";
import DupeModal from "./components/DupeModal";
import SkeletonCard from "./components/SkeletonCard";
import PriceComparison from "./components/PriceComparison";
import Navbar from "./components/Navbar";
import Categories from "./pages/Categories";
import Wishlist from "./pages/Wishlist";
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

function getBestDupe(results) {
  if (!results.length) return null;
  return results.reduce((best, curr) => {
    const bestScore = (parseFloat(best.productRating) || 0) - (best.price / 100);
    const currScore = (parseFloat(curr.productRating) || 0) - (curr.price / 100);
    return currScore > bestScore ? curr : best;
  });
}

function App() {
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSort, setActiveSort] = useState("relevant");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedDupe, setSelectedDupe] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch { return []; }
  });
  const resultsRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (dupe) => {
    setWishlist(prev => {
      const exists = prev.find(d => d.asin === dupe.asin);
      return exists ? prev.filter(d => d.asin !== dupe.asin) : [...prev, dupe];
    });
  };

  const isWishlisted = (dupe) => wishlist.some(d => d.asin === dupe.asin);

  const fetchDupes = async (query) => {
    setLoading(true);
    setActiveQuery(query);
    setOriginalPrice(null);
    try {
      const res = await fetch(`http://localhost:5001/api/amazon/search?q=${query}+dupe`);
      const data = await res.json();
      setResults(data);
      setSearched(true);
      setActiveSort("relevant");

      const origRes = await fetch(`http://localhost:5001/api/amazon/original?q=${query}`);
      const origData = await origRes.json();
      setOriginalPrice(origData.price);
    } catch (err) {
      console.error("Error fetching dupes:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searched && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results, searched]);

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

  const bestDupe = getBestDupe(results);

  const HomePage = (
    <>
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

      <main className="results-section" ref={resultsRef}>
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

        {searched && !loading && originalPrice && bestDupe && (
          <PriceComparison
            query={activeQuery}
            originalPrice={originalPrice}
            dupePrice={bestDupe.price}
          />
        )}

        {loading && (
          <div className="results-grid">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="empty-state">
            <p className="empty-emoji">🛍️</p>
            <p className="empty-title">No dupes found</p>
            <p className="empty-sub">Try searching something else — we're always adding more!</p>
          </div>
        )}

        <div className="results-grid">
          {!loading && getSortedResults().map((dupe, index) => (
            <DupeCard
              key={index}
              {...dupe}
              isBest={bestDupe && dupe.asin === bestDupe.asin}
              isWishlisted={isWishlisted(dupe)}
              onWishlist={() => toggleWishlist(dupe)}
              onClick={() => setSelectedDupe(dupe)}
            />
          ))}
        </div>
      </main>
    </>
  );

  return (
    <div className="app">
      <Navbar wishlistCount={wishlist.length} />
      <Routes>
        <Route path="/" element={HomePage} />
        <Route path="/categories" element={<Categories onSearch={fetchDupes} />} />
        <Route path="/wishlist" element={
          <Wishlist
            wishlist={wishlist}
            onWishlist={toggleWishlist}
            onCardClick={setSelectedDupe}
          />}
        />
      </Routes>
      {selectedDupe && (
        <DupeModal
          dupe={selectedDupe}
          onClose={() => setSelectedDupe(null)}
          isWishlisted={isWishlisted(selectedDupe)}
          onWishlist={() => toggleWishlist(selectedDupe)}
        />
      )}
    </div>
  );
}

export default App;