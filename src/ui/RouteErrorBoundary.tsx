import { Component, type ErrorInfo, type ReactNode } from "react";

interface RouteErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return {
      hasError: true
    };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Keep the UI responsive even when a route subtree fails to render.
  }

  componentDidUpdate(previousProps: RouteErrorBoundaryProps) {
    if (this.state.hasError && previousProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="empty-state card-surface danger-surface">
          <p className="eyebrow">Page error</p>
          <h2>{this.props.fallbackTitle || "This activity could not load."}</h2>
          <p>
            {this.props.fallbackMessage ||
              "Something on this page broke while it was loading. You can go back to the week list or open another activity."}
          </p>
        </section>
      );
    }

    return this.props.children;
  }
}
