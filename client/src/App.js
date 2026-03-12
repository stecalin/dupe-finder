import { useState } from "react";
import SearchBar from "./components/SearchBar";
import DupeCard from "./components/DupeCard";
import "./App.css";

function App() {
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/amazon/search?q=${query}+dupe`);
      const data = await res.json();
      setResults(data);
      setSearched(true);
    } catch (err) {
      console.error("Error fetching dupes:", err);
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="hero">
        <p className="tagline">✨ luxury looks, budget prices</p>
        <h1 className="title">Dupe Finder</h1>
        <p className="subtitle">Search any luxury item and find affordable alternatives you'll actually love</p>
        <SearchBar onSearch={handleSearch} />
      </header>

      <main className="results-section">
        {loading && <p className="no-results">Finding dupes... ✨</p>}
        {!loading && searched && results.length === 0 && (
          <p className="no-results">No dupes found yet — we're always adding more! 🛍️</p>
        )}
        <div className="results-grid">
          {results.map((dupe, index) => (
            <DupeCard key={index} {...dupe} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;