// Reset.js
import React from 'react';
import Layout from '../Pages/Layout';
import api from '../api';
import { LargeButton } from '../Buttons/ButtonComponent';
import '../Buttons/ButtonComponent.css';

const Reset = () => {
  const handleResetClick = async () => {
    try {
      await api.resetRegistry();
      // Optionally, you can perform any additional actions after the reset is successful
      console.log('Registry reset successfully');
    } catch (error) {
      console.error('Error resetting registry', error);
      // Handle error or show a notification to the user
    }
  };

  return (
    <Layout>
      <div style={{ textAlign: 'center' }}>
        <h1>Reset</h1>
        <LargeButton onClick={handleResetClick}>Reset Registry</LargeButton>
      </div>
    </Layout>
  );
};

export default Reset;
