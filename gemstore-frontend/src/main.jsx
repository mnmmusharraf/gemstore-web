import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";

// Styles
import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Context Provider
import AuthProvider from "./context/AuthProvider";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        {/* <ToastContainer position="top-right" autoClose={3000} /> */}
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);