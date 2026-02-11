
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AlertCircle, RefreshCw } from 'lucide-react';

// --- ROBUST ERROR BOUNDARY ---
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
             <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-rose-500" size={32} />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
             <p className="text-slate-500 mb-8 font-medium">
               The application encountered an unexpected error. This often happens due to corrupted browser data or connection issues.
             </p>
             <div className="space-y-3">
               <button 
                 onClick={() => {
                   localStorage.clear();
                   window.location.reload();
                 }}
                 className="w-full flex items-center justify-center space-x-2 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors shadow-lg"
               >
                 <span>Clear Data & Reset App</span>
               </button>
               <button 
                 onClick={() => window.location.reload()}
                 className="w-full flex items-center justify-center space-x-2 bg-sky-600 text-white font-bold py-3 rounded-xl hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200"
               >
                 <RefreshCw size={18} />
                 <span>Try Normal Reload</span>
               </button>
             </div>
             {this.state.error && (
               <p className="mt-6 text-[10px] text-slate-300 font-mono truncate">
                 {this.state.error.message}
               </p>
             )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
