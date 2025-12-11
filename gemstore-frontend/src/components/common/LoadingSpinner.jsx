import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="profile-loading">
    <div className="profile-spinner"></div>
    <span>{message}</span>
  </div>
);

export default LoadingSpinner;