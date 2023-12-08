// Directory.js
import React, { useState, useEffect } from 'react';
import Layout from '../Pages/Layout';
import api from '../api'; // Adjust the path based on your project structure
import Package from '../Package'; // Import the Package component

const Directory = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // Call searchPackages with parameter '*'
      const packageQuery = [
        {
          Name: '*'
        }
      ]
      console.log(packageQuery);
      const searchResult = await api.searchPackages(packageQuery, null);
      setPackages(searchResult);
    } catch (error) {
      console.error('Error fetching packages:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch all packages when the component mounts
    fetchPackages();
  }, []); // Empty dependency array to fetch only once when the component mounts

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
        <h1>Directory</h1>

        {/* Display the Package components for each package */}
        {packages.map((packageItem) => (
          <div key={packageItem.ID}>
            <Package ID={packageItem.ID} result={packageItem} onButtonClick={handleButtonClick} />
          </div>
        ))}

        {/* Show a loading indicator while fetching the packages */}
        {loading && <p>Loading...</p>}

        {/* Add content specific to the directory page */}
        <div>
          {/* Add your additional content here */}
        </div>
      </div>
    </Layout>
  );
};

export default Directory;