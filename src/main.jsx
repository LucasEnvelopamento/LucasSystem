import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

window.addEventListener('error', (event) => {
  document.body.innerHTML = `<div style="color:white;padding:20px;font-family:monospace;z-index:9999;position:absolute;inset:0;background:#9f1239"><h1>Global Error Captured</h1><pre style="white-space:pre-wrap">${event.error?.stack || event.message}</pre></div>`;
});
window.addEventListener('unhandledrejection', (event) => {
  document.body.innerHTML = `<div style="color:white;padding:20px;font-family:monospace;z-index:9999;position:absolute;inset:0;background:#9f1239"><h1>Unhandled Promise Captured</h1><pre style="white-space:pre-wrap">${event.reason?.stack || event.reason}</pre></div>`;
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fef2f2', color: '#9f1239', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Algo deu muito errado (Error Boundary)</h1>
          <p style={{ marginTop: '10px', fontSize: '16px' }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff1f2', overflowX: 'auto', fontSize: '12px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
