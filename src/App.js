import './App.css';
// App.js
import React, { useState } from 'react';
import HomePage from './components/Pages/HomePage';
import Search from './components/Pages/Search';
import Help from './components/Pages/Help';
import Directory from './components/Pages/Directory';
import Upload from './components/Pages/Upload';
import { TopButton, LargeButton } from './components/Buttons/ButtonComponent';
import './components/Buttons/ButtonComponent.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <Search />;
      case 'help':
        return <Help />;
      case 'directory':
        return <Directory />;
      case 'upload':
        return <Upload />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      {/* Add navigation or buttons to change the current page */}
      <div className="buttonContainer">
        <TopButton onClick={() => setCurrentPage('home')}>Home</TopButton>
        <TopButton onClick={() => setCurrentPage('search')}>Search</TopButton>
        <TopButton onClick={() => setCurrentPage('directory')}>Directory</TopButton>
        <TopButton onClick={() => setCurrentPage('upload')}>Upload</TopButton>
        <TopButton onClick={() => setCurrentPage('help')}>Help</TopButton>
      </div>
      {/* Render the current page */}
      {renderPage()}
    </div>
  );
};

export default App;
