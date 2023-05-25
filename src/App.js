import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

const LazyChunk = React.lazy(() => import(/* webpackPrefetch: true */ './LazyChunk'));

const App = () => {
  const [shouldShowLazyChunk, setShouldShowLazyChunk] = useState(false);

  const toggleBuild = () => {
    location.href = window.LEGACY ? `${location.pathname}?forced-modern=1` : `${location.pathname}?forced-legacy=1`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <a
          onClick={() => setShouldShowLazyChunk(true)}
          className="App-link"
        >
          Show build info
        </a>

        <a onClick={toggleBuild} className="App-link">
          Toggle build
        </a>

        {shouldShowLazyChunk && (
          <React.Suspense fallback={null}>
            <LazyChunk onClick={() => setShouldShowLazyChunk(false)} />
          </React.Suspense>
        )}
      </header>
    </div>
  );
}

export default App;
