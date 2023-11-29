// fakeApi.js
const registeredUsers = [
    { id: 1, username: 'guest', password: 'guest' },
    // Add more registered users as needed
  ];
  
  export const loginUser = async (username, password) => {
    // Simulate an API call to check credentials
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = registeredUsers.find(user => user.username === username && user.password === password);
        if (user) {
          resolve({ id: user.id, username: user.username });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500); // Simulating a delay similar to a real API call
    });
  };
  
  export const registerUser = async (username, password) => {
    // Simulate an API call to register a new user
    return new Promise(resolve => {
      setTimeout(() => {
        const newUser = { id: registeredUsers.length + 1, username, password };
        registeredUsers.push(newUser);
        resolve({ id: newUser.id, username: newUser.username });
      }, 500); // Simulating a delay similar to a real API call
    });
  };
  
  export const removeAccount = async (id) => {
    // Simulate an API call to remove a user account
    return new Promise(resolve => {
      setTimeout(() => {
        const index = registeredUsers.findIndex(user => user.id === id);
        if (index !== -1) {
          registeredUsers.splice(index, 1);
          resolve();
        } else {
          resolve(); // If the user is not found, resolve anyway (simulating success)
        }
      }, 500); // Simulating a delay similar to a real API call
    });
  };
  