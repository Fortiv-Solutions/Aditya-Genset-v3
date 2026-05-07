import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-red-600 mb-2">
                Application Error
              </h1>
              <p className="text-gray-600">
                Something went wrong. Please check the details below.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h2 className="font-bold text-red-800 mb-2">Error Details:</h2>
              <pre className="text-sm text-red-700 whitespace-pre-wrap break-words">
                {this.state.error?.message}
              </pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="font-bold text-blue-800 mb-2">Common Solutions:</h2>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-2">
                <li>Check if the <code className="bg-blue-100 px-1 rounded">.env</code> file exists in the project root</li>
                <li>Verify Supabase credentials are correct in <code className="bg-blue-100 px-1 rounded">.env</code></li>
                <li>Restart the development server: <code className="bg-blue-100 px-1 rounded">npm run dev</code></li>
                <li>Check browser console (F12) for more details</li>
                <li>Clear browser cache and reload</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>If the problem persists, check the terminal for server errors.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
