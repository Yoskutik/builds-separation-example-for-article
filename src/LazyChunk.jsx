import React from 'react';
import './LazyChunk.css';

const LazyChunk = ({ onClick }) => (
  <dialog open onClick={onClick}>
    <h2>Build info</h2>
    <p>Current build is <b>{window.LEGACY ? 'legacy' : 'modern'}</b></p>
    <p>You can open Developer Tools to see how much of JavaScript code you download in each build</p>
    <button onClick={onClick}>Close dialog</button>
  </dialog>
);

export default LazyChunk;