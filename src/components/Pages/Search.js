// Search.js
import React, { useState } from 'react';
import Layout from '../Pages/Layout';
import Package from '../Package';
import api from '../api';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleToggleRegex = () => {
    setUseRegex((prevValue) => !prevValue);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    // Replace this with your actual search logic that fetches or computes results
    const results = await performSearch(searchQuery, useRegex);

    // Update the state with the search results
    setSearchResults(results);
  };

  const handleButtonClick = async (resultId, buttonType) => {
    try {
      switch (buttonType) {
        case 'Update':
          // Handle Update button click
          alert(`Update button clicked for result with ID ${resultId}`);
          // Example: Fetch the package details and perform an update
          const packageDetails = await api.getPackage(resultId);
          // Perform your update logic based on packageDetails
          break;

        case 'Rate':
          // Handle Rate button click
          alert(`Rate button clicked for result with ID ${resultId}`);
          // Example: Rate the package
          const ratingResult = await api.ratePackage(resultId, 'exampleFilename.txt');
          // Handle the rating result
          break;

        case 'Download':
          // Handle Download button click
          alert(`Download button clicked for result with ID ${resultId}`);
          // Example: Download the package
          const downloadResult = await api.downloadPackage(resultId);
          // Handle the download result
          break;

        default:
          console.warn(`Unknown button type: ${buttonType}`);
      }
    } catch (error) {
      console.error('Error handling button click:', error.message);
    }
  };


  return (
    <Layout>
      <div style={{ textAlign: 'center' }}>
        <h1>Search</h1>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Enter search query"
            style={{ padding: '10px', fontSize: '1.2rem', width: '70%', marginRight: '10px' }}
          />
          <button type="submit" style={{ padding: '10px', fontSize: '1.2rem' }}>
            Search
          </button>
        </form>
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <label style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={useRegex}
              onChange={handleToggleRegex}
              style={{ fontSize: '1.5rem', margin: '0 10px 0 0' }}
            />
            Use Regex Search
          </label>
        </div>

        {/* Display search results using Package */}
        {searchResults && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h2>{`Search Results for "${searchQuery}"`}</h2>
            {searchResults.map((result, index) => (
              <Package key={index} result={result} onButtonClick={handleButtonClick}/>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

// Perform search logic, replace with your actual implementation
const performSearch = async (query, useRegex) => {
  // Simulate an asynchronous search operation
  // Replace this with your actual logic (e.g., API call, data fetching)
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = [
        { name: 'Result 1', id: 1 },
        { name: 'Result 2', id: 2 },
        { name: 'Result 3', id: 3 },
        { name: 'Result 4', id: 4 },
        { name: 'Result 5', id: 5 },
      ];
      resolve(results);
    }, 1000);
  });
};

export default Search;
