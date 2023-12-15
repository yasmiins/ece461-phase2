//Package.js
import React, { useState } from 'react';
import { TopButton, LargeButton } from './Buttons/ButtonComponent';
import './Buttons/ButtonComponent.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import api from './api';

const isBase64 = (str) => {
    try {
        return btoa(atob(str)) === str;
    } catch (error) {
        return false;
    }
};

const Package = ({ ID, result, onButtonClick }) => {
    const [packageScores, setPackageScores] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [rateLoading, setRateLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);

    const handleButtonClick = async (buttonType) => {
        // Set loading state based on the button type
        switch (buttonType) {
            case 'Update':
                setUpdateLoading(true);
                break;
            case 'Rate':
                setRateLoading(true);
                break;
            case 'Download':
                setDownloadLoading(true);
                break;
            default:
                break;
        }

        // Check if onButtonClick returns a promise
        const resultPromise = onButtonClick(ID, buttonType);

        if (resultPromise && resultPromise.then && typeof resultPromise.then === 'function') {
            // It's a promise, so wait for it
            await resultPromise;
        }

        // Handle other button types
        switch (buttonType) {
            case 'Update':
                // Handle Update button click
                console.log('Update button clicked for ID:', ID);
                const packageDetails = await api.getPackage(ID);
                console.log('Package Details:', packageDetails);
                const packageUpdated = await api.updatePackage(ID, packageDetails);
                console.log('Package Updated Message:', packageUpdated);
                // Implement your logic here
                setUpdateLoading(false); // Update loading state after completion
                break;

            case 'Rate':
                // Handle Rate button click
                console.log('Rate button clicked for ID:', ID);
                const ratingResult = await api.ratePackage(ID);
                console.log('Rating Result:', ratingResult);
                // Update the package scores in the state
                setPackageScores(ratingResult[0]);
                // Implement your logic here
                setRateLoading(false); // Update loading state after completion
                break;

            case 'Download':
                // Handle Download button click
                if (isBase64(result.data.Content)) {
                    const content = atob(result.data.Content);

                    // Try to save the content as a zip file
                    try {
                        const zip = new JSZip();
                        const folderName = `${result.metadata.Name}-${result.metadata.Version}`;

                        // Create a folder in the zip file
                        const folder = zip.folder(folderName);

                        // Add the content as a binary file inside the folder
                        folder.file(`${folderName}.bin`, content, { binary: true });

                        // Generate a blob from the zip content
                        const zipBlob = await zip.generateAsync({ type: 'blob' });

                        // Save the blob as a file
                        saveAs(zipBlob, `${result.metadata.Name}-${result.metadata.Version}.zip`);
                    } catch (error) {
                        console.error('Error creating or saving the zip file:', error.message);
                    }
                } else {
                    console.warn('Content is not in base64 format');
                }
                // Implement your logic here
                setDownloadLoading(false); // Update loading state after completion
                break;

            default:
                console.warn(`Unknown button type: ${buttonType}`);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', margin: '10px 0' }}>
            <h1>Package Name: {result.metadata.Name}</h1>
            <h2>Package ID: {result.metadata.ID}</h2>
            <h2>Version: {result.metadata.Version}</h2>
            {/* Display the package scores if available */}
            {packageScores !== null && (
                <div>
                    <h2>Package Ratings:</h2>
                    <h3>NET_SCORE: {packageScores.NET_SCORE}</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {Object.entries(packageScores)
                            .filter(([key]) => key !== 'URL' && key !== 'NET_SCORE') // Filter out the 'URL' and 'NET_SCORE' keys
                            .map(([key, value]) => (
                                <li key={key}>
                                    <strong>{key}:</strong> {value}
                                </li>
                            ))}
                    </ul>
                </div>
            )}

            {/* Add your buttons or any other content here */}
            <div>
                <LargeButton onClick={() => handleButtonClick('Update')} disabled={updateLoading}>
                    {updateLoading ? 'Updating...' : 'Update'}
                </LargeButton>
                <LargeButton onClick={() => handleButtonClick('Rate')} disabled={rateLoading}>
                    {rateLoading ? 'Rating...' : 'Rate'}
                </LargeButton>
                <LargeButton onClick={() => handleButtonClick('Download')} disabled={downloadLoading}>
                    {downloadLoading ? 'Downloading...' : 'Download'}
                </LargeButton>
            </div>
        </div>
    );
};

export default Package;
