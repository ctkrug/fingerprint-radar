import { mountApp } from './app.js';

const root = document.getElementById('app');
if (root) {
  mountApp(root).catch((error) => {
    // Never leave a blank screen: surface a designed error state.
    root.innerHTML = `
      <div class="fatal">
        <h1>Radar offline</h1>
        <p>Something went wrong measuring your browser. Try reloading — nothing was sent anywhere.</p>
      </div>
    `;
    console.error('Fingerprint Radar failed to start:', error);
  });
}
