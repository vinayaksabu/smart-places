import { useState } from 'react'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;
    
    setHasSearched(true);
    setIsLoading(true);
    setResults([]); // Clear the old results

    try {
      // Talking to the live OpenStreetMap API
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=6`);
      const data = await response.json();

      // Formatting the messy API data to fit our clean Nothing OS cards
      const liveData = data.map((place) => ({
        id: place.place_id,
        name: place.name ? place.name.toUpperCase() : place.type.toUpperCase().replace('_', ' '),
        description: place.display_name.toUpperCase(),
        // OpenStreetMap doesn't do 5-star ratings, so we use a Live tag
        rating: "LIVE", 
        // Showing exact GPS coordinates for that technical aesthetic
        distance: `GPS: ${parseFloat(place.lat).toFixed(4)}, ${parseFloat(place.lon).toFixed(4)}`
      }));

      setResults(liveData);
    } catch (error) {
      console.error("SYSTEM ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="nothing-container">
      <header className="nothing-header">
        <h1>SMART<span>_</span>PLACES</h1>
        <p>SYSTEM.LOCATE(TARGET)</p>
      </header>

      <main className="nothing-main">
        <div className="nothing-search-pill">
          <input 
            type="text" 
            placeholder="ENTER PARAMETERS (E.G., HOTELS IN IDUKKI, KERALA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nothing-input"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="nothing-btn" onClick={handleSearch}>
            [ EXECUTE ]
          </button>
        </div>

        <div className="nothing-grid">
          {!hasSearched && (
            <div className="nothing-card placeholder">
              <h3>STATUS: IDLE</h3>
              <p>WAITING FOR INPUT...</p>
            </div>
          )}

          {isLoading && (
            <div className="nothing-card placeholder">
              <h3>STATUS: FETCHING...</h3>
              <p>PULLING SATELLITE DATA.</p>
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <div className="nothing-card placeholder">
              <h3>STATUS: 404</h3>
              <p>NO TARGETS FOUND IN SECTOR.</p>
            </div>
          )}

          {!isLoading && results.map((place) => (
            <div key={place.id} className="nothing-card">
              <div className="card-top-accent"></div>
              <div className="card-header">
                <h3>{place.name}</h3>
                <span className="rating">[{place.rating}]</span>
              </div>
              <p>{place.description}</p>
              <div className="card-footer">
                <span className="distance-tag">{place.distance}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App