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
  
    // Basic input validation
    if (typeof searchQuery !== 'string') {
      console.error('Invalid search query type');
      return;
    }
  
    // Continue with the search logic
    try {
      let results;
      if (useRegex) {
        console.log('Regex Search');
        results = await api.regexSearch(searchQuery);
      } else {
        const packageQueries = [
          {
            Name: searchQuery
          }
        ];
        results = await api.searchPackages(packageQueries, null);
      }
  
      // Adjust the structure of the search results to fit the Package component's expectations
      const adjustedResults = await Promise.all(
        results.map(async (result) => ({
        metadata: {
          ID: result.ID,
          Name: result.Name,
          Version: result.Version
          // Add other metadata properties as needed
        },
        data: {
          Content: (await api.getPackage(result.ID)).data.Content,
        }
      }))
      );
      console.log('SEARCH',adjustedResults)
      setSearchResults(adjustedResults);
    } catch (error) {
      console.error('Error during search:', error.message);
    }
  };


  const handleButtonClick = async (resultId, buttonType) => {
    try {
      switch (buttonType) {
        case 'Update':
          // Handle Update button click
          console.log(`Update button clicked for package ${resultId}`);
          // Example: Fetch the package details and perform an update
          break;

        case 'Rate':
          // Handle Rate button click
          console.log(`Rate button clicked for package ${resultId}`);
          // Example: Rate the package
          // Handle the rating result
          break;

        case 'Download':
          // Handle Download button click
          console.log(`Download button clicked for package ${resultId}`);
          // Example: Download the package
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
        {searchResults && searchResults.length > 0 ? (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h2>{`Search Results for "${searchQuery}"`}</h2>
            {searchResults.map((result) => (
              <Package key={result.metadata.ID} ID={result.metadata.ID} result={result} onButtonClick={handleButtonClick} />
            ))}
          </div>
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </Layout>
  );
};

export default Search;
