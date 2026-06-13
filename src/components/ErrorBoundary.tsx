import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full border border-gray-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Something went wrong</h1>
            </div>
            <p className="text-gray-600 mb-6">
              The application encountered an unexpected error. This is a custom Error Boundary to help debug the issue.
            </p>
            
            {this.state.error && (
              <div className="bg-gray-50 p-6 rounded-md border border-gray-200 overflow-auto max-h-[60vh] text-left">
                <p className="font-mono text-sm text-red-600 font-bold mb-4 border-b pb-2 border-gray-200">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Component Stack:</h3>
                      <pre className="font-mono text-xs text-gray-600 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border border-gray-200">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Error Stack:</h3>
                        <pre className="font-mono text-xs text-gray-600 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border border-gray-200">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 flex gap-4">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
