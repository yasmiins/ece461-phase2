// Upload.js
import React, { useState } from 'react';
import Layout from '../Pages/Layout';
import api from '../api'; // Adjust the path based on your project structure
import { TopButton, LargeButton } from '../Buttons/ButtonComponent';
import '../Buttons/ButtonComponent.css';

const Upload = () => {
  const [packageContent, setPackageContent] = useState(null);
  const [packageURL, setURL] = useState(undefined);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useContent, setUseContent] = useState(true); // Default to Content

  const handleUpload = async () => {
    try {
      // Start loading
      setLoading(true);

      // Prepare package data based on the selected option
      const packageData = useContent
        ? { 
            Content: packageContent 
        }
        : { 
            URL: packageURL
        };

      // Upload package using the API function
      const result = await api.uploadPackage(packageData);

      // Update state with the upload result
      setUploadResult(result);
      setError(null);
    } catch (error) {
      // Handle errors
      setUploadResult(null);
      setError(error.message);
    } finally {
      // Stop loading, whether successful or not
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ textAlign: 'center' }}>
        <h1>Upload</h1>

        {/* Toggle between Content and URL */}
        <div>
          <label>
            <input
              type="radio"
              value="content"
              checked={useContent}
              onChange={() => setUseContent(true)}
            />
            Content (Zip File)
          </label>
          <label>
            <input
              type="radio"
              value="url"
              checked={!useContent}
              onChange={() => setUseContent(false)}
            />
            URL
          </label>
        </div>

        {/* Conditionally render Content or URL input based on the selected option */}
        {useContent ? (
          <div>
            <label>Package Content (Zip File): </label>
            <input type="file" onChange={(e) => setPackageContent(e.target.files[0])} />
          </div>
        ) : (
          <div>
            <label>Package Github URL: </label>
            <input type="text" value={packageURL} onChange={(e) => setURL(e.target.value)} />
          </div>
        )}

        <LargeButton onClick={handleUpload} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Package'}
        </LargeButton>

        {/* Display upload result or error message */}
        {uploadResult && (
          <p style={{ color: 'green' }}>
            Package uploaded successfully. Result: {JSON.stringify(uploadResult)}
          </p>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </Layout>
  );
};

export default Upload;
