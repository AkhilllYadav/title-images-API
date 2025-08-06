import React, { useState } from 'react';
import axios from 'axios';
import Results from './components/Results';
import SearchBar from './components/SearchBar';
import './App.css';

const API_KEY = 'cChJVRjIXEs3hA4JLdOq99BGaSI7qYJe';

const App = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = (query) => {
    fetchResults(query);
  };

  const fetchResults = async (query) => {
    setLoading(true);
    setError('');
    setResults([]); // Clear previous results
    try {
      console.log(`Fetching titles for query: ${query}`);

      // Fetch titles
      const response = await axios.get('https://api.apilayer.com/unogs/search/titles', {
        params: { title: query },
        headers: { 'apikey': API_KEY },
      });
      const titles = response.data.results || [];
      console.log('Titles fetched:', titles);

      if (titles.length === 0) {
        setError('No results found.');
        return;
      }

      // Fetch images for each title
      const titlesWithImages = await Promise.all(titles.map(async (title) => {
        try {
          console.log(`Fetching images for netflix_id: ${title.netflix_id}`);
          const imagesResponse = await axios.get('https://api.apilayer.com/unogs/title/images', {
            params: { netflix_id: title.netflix_id },
            headers: { 'apikey': API_KEY },
          });
          console.log(`Images fetched for ${title.netflix_id}:`, imagesResponse.data.results);
          return { ...title, images: imagesResponse.data.results || [] };
        } catch (imageErr) {
          console.error(`Error fetching images for ${title.netflix_id}:`, imageErr);
          return { ...title, images: [] };
        }
      }));

      setResults(titlesWithImages);
    } catch (err) {
      console.error('Error fetching titles:', err);
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <SearchBar onSearch={handleSearch} />
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {results.length > 0 && <Results results={results} />}
    </div>
  );
};

export default App;
