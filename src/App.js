import './App.css';
// App.js
import React, { useState } from 'react';
import InfoPage from './components/Pages/InfoPage';
import Search from './components/Pages/Search';
import Reset from './components/Pages/Reset';
import Directory from './components/Pages/Directory';
import Upload from './components/Pages/Upload';
import { TopButton, LargeButton } from './components/Buttons/ButtonComponent';
import './components/Buttons/ButtonComponent.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('info');

  const renderPage = () => {
    switch (currentPage) {
      case 'info':
        return <InfoPage />;
      case 'search':
        return <Search />;
      case 'reset':
        return <Reset />;
      case 'directory':
        return <Directory />;
      case 'upload':
        return <Upload />;
      default:
        return <InfoPage />;
    }
  };

  return (
    <div className="App">
      {/* Add navigation or buttons to change the current page */}
      <div className="buttonContainer">
        <TopButton onClick={() => setCurrentPage('info')}>Info</TopButton>
        <TopButton onClick={() => setCurrentPage('search')}>Search</TopButton>
        <TopButton onClick={() => setCurrentPage('directory')}>Directory</TopButton>
        <TopButton onClick={() => setCurrentPage('upload')}>Upload</TopButton>
        <TopButton onClick={() => setCurrentPage('reset')}>Reset</TopButton>
      </div>
      {/* Render the current page */}
      {renderPage()}
    </div>
  );
};

export default App;
