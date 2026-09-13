import React from 'react';
import { AlertCircle, RefreshCw, Shield } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Realm Error Boundary Caught Tremor:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-rpg-dark text-slate-100 flex items-center justify-center p-4">
          <div className="bg-rpg-panel border-4 border-red-700 rounded-lg p-6 max-w-md w-full text-center shadow-pixel">
            <div className="inline-block p-3 rounded-full bg-red-950 border-2 border-red-500 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="font-pixel text-sm text-red-400 mb-2">
              A Tremor Shook the Realm
            </h2>
            <p className="text-xs font-mono text-slate-300 mb-6 leading-relaxed">
              An unexpected disturbance interrupted the arcane flow. Rest assured, your character progression is safely guarded.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 rounded bg-red-800 hover:bg-red-700 text-white font-mono text-xs font-bold shadow-pixel-sm border border-red-500 flex items-center justify-center gap-2 transition active:translate-y-0.5"
            >
              <RefreshCw className="w-4 h-4" />
              Re-enter Realm (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
