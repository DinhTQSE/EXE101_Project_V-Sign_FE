import { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Unhandled app error", error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="card-pastel max-w-md w-full p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="font-display font-extrabold text-xl text-foreground mb-2">Ung dung bi gian doan</h1>
          <p className="font-body text-sm text-muted-foreground mb-5">
            Mot loi khong mong muon da xay ra. Tai lai trang de khoi phuc phien hoc hien tai.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary-gradient inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Tai lai
          </button>
        </div>
      </div>
    );
  }
}
