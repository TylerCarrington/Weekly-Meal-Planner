import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { PlannerProvider } from './contexts/PlannerContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PlannerProvider>
        <App />
      </PlannerProvider>
    </AuthProvider>
  </StrictMode>,
);
