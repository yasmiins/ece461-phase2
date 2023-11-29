// Directory.js
import React, { useState, useEffect } from 'react';
import Layout from '../Pages/Layout';
import api from '../api'; // Adjust the path based on your project structure
import Package from '../Package'; // Import the Package component

const Directory = () => {
    const [packageIds, setPackageIds] = useState(['node_core_test_id', 'readmeio123', 'winston123']);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const packageDetailsPromises = packageIds.map(async (packageId) => {
          const packageDetails = await api.getPackage(packageId);
          return { packageId, packageDetails };
        });
  
        const packages = await Promise.all(packageDetailsPromises);
        setPackages(packages);
      } catch (error) {
        console.error('Error fetching packages:', error.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    // Fetch a single package when the component mounts
    fetchPackages();
  }, [packageIds]); // Empty dependency array to fetch only once when the component mounts

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
          <div key={packageItem.packageId}>
            <Package ID={packageItem.packageId} result={packageItem.packageDetails} onButtonClick={handleButtonClick} />
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