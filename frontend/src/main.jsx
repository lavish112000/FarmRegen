import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { setupTokenRefresh } from './services/api';
import './index.css';

// Setup token refresh on app load if user is authenticated
if (localStorage.getItem('token') && localStorage.getItem('refreshToken')) {
  setupTokenRefresh();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
