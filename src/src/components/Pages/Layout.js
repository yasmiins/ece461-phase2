// Layout.js
import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="container">
      <div className="header">
        {/* Main content area */}
        {children}
      </div>
      <div className="content">
        {/* Sidebar content goes here */}
        <div style={{ textAlign: 'center' }}>
          {/* Add links or other sidebar content */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
