import React from 'react';
import { AlertTriangle, RotateCcw, Home, UtensilsCrossed } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TasteCraft ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 font-serif-brand">
                Oops! Something went wrong
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                An unexpected interface error occurred. Don't worry, your data and preferences are safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left overflow-x-auto">
                <p className="text-xs font-mono text-slate-700 font-medium">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/25"
              >
                <Home className="w-4 h-4" />
                <span>Go to Homepage</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
              <UtensilsCrossed className="w-3.5 h-3.5 text-brand-500" />
              <span>TasteCraft Restaurant Platform</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

