import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';
import Ingreso from './components/Ingreso.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Ingreso>
        <App />
      </Ingreso>
    </ErrorBoundary>
  </StrictMode>,
);
