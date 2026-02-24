
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

const rootElement = document.getElementById('root');

if (!rootElement) {
  // Should allow the global error handler in index.html to catch this
  throw new Error("FATAL: Could not find root element to mount to");
}

console.log("System initializing...");

try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("System mounted successfully.");
} catch (e) {
    console.error("System failed to mount:", e);
    throw e; // Re-throw to be caught by global handler
}
