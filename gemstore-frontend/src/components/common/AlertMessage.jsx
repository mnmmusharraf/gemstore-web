import React from 'react';

const AlertMessage = ({ type, message, onClose }) => {
  if (!message) return null;

  const className = type === 'success' ? 'profile-success' : 'profile-error';

  return (
    <div className={className}>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
};

export default AlertMessage;