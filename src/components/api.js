// api.js
const BASE_URL = 'http://ec2-18-222-159-163.us-east-2.compute.amazonaws.com';

const api = {
    uploadPackage: async (packageData) => {
        try {
            const url = `${BASE_URL}/package`;
            console.log('Request URL:', url);
            console.log('Request Data:', packageData); // Add this line for debugging

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(packageData),
            });
    
            console.log('Response Status:', response.status);
    
            if (response.ok) {
                const result = await response.json();
                console.log('Upload Result:', result);
                return result;
            } else {
                throw new Error(`Failed to upload package: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error uploading package:', error.message);
            throw new Error(`Error uploading package: ${error.message}`);
        }
    },
    

    getPackage: async (packageId) => {
        try {
          const response = await fetch(`${BASE_URL}/package/${packageId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (response.ok) {
            const result = await response.json();
            return result;
          } else if (response.status === 404) {
            throw new Error('Package does not exist.');
          } else {
            throw new Error(`Failed to retrieve package: ${response.statusText}`);
          }
        } catch (error) {
          throw new Error(`Error retrieving package: ${error.message}`);
        }
    },

    updatePackage: async (packageId, packageData) => {
        try {
          const response = await fetch(`${BASE_URL}/package/${packageId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(packageData),
          });
    
          if (response.ok) {
            const result = await response.json();
            return result;
          } else if (response.status === 404) {
            throw new Error('Package does not exist.');
          } else {
            throw new Error(`Failed to update package: ${response.statusText}`);
          }
        } catch (error) {
          throw new Error(`Error updating package: ${error.message}`);
        }
      },

      ratePackage: async (packageId) => {
        try {
          const response = await fetch(`${BASE_URL}/package/${packageId}/rate`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (response.ok) {
            const result = await response.json();
            return result;
          } else if (response.status === 404) {
            throw new Error('Package does not exist.');
          } else {
            throw new Error(`Failed to rate package: ${response.statusText}`);
          }
        } catch (error) {
          throw new Error(`Error rating package: ${error.message}`);
        }
      },
};

export default api;
