import React from 'react';
import ReactDOM from 'react-dom/client';
import 'core-js';
import './index.css';

const App = React.lazy(() => import('./App'));

const root = ReactDOM.createRoot(document.body);
root.render(
  <React.StrictMode>
    <React.Suspense fallback="Loading...">
      <App />
    </React.Suspense>
  </React.StrictMode>
);
