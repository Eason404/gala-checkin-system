import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-white text-center">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 shadow-2xl max-w-md w-full">
            <div className="w-16 h-16 bg-cny-red rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">出了一点小问题</h2>
            <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-6">Something went wrong</p>
            
            <div className="bg-black/20 p-4 rounded-xl text-left mb-6 overflow-auto max-h-40">
                <p className="font-mono text-xs text-red-200 break-all">
                    {this.state.error?.message || "Unknown Error"}
                </p>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-white text-cny-red rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> 刷新页面 Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
