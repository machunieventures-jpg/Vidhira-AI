import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    // Clear potentially corrupted state from localStorage and reload
    localStorage.removeItem('vidhiraUserData');
    localStorage.removeItem('vidhiraReport');
    localStorage.removeItem('vidhiraUnlockStatus');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="glass-card max-w-lg w-full text-center">
                <div className="mx-auto mb-4 text-5xl">
                    <span role="img" aria-label="cosmic anomaly">💫</span>
                </div>
                <h1 className="text-3xl font-bold text-[--rose-accent]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Cosmic Anomaly Detected
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                    An unexpected disturbance in the cosmic flow has occurred. Our celestial engineers have been notified.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">
                    Please try resetting the application to restore balance.
                </p>
                
                {this.state.error && (
                    <details className="mt-4 text-left bg-black/5 dark:bg-white/5 p-3 rounded-lg text-xs">
                        <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300">
                            Technical Details
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap font-mono text-gray-500 dark:text-gray-400">
                            <code>{this.state.error.toString()}</code>
                        </pre>
                    </details>
                )}

                <button
                    onClick={this.handleReset}
                    className="btn-cosmic w-full mt-6"
                >
                    Reset and Start Over
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;