import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Boundary caught:", error, info);
    // send to Sentry, Datadog, etc.
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <p>Something went wrong.</p>;
    }
    return this.props.children;
  }
}

export function ErrorPage() { 
    return ( 
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>Obobo!</h1>
            <p>Ndodhi një gabim. Ju lutemi provoni përsëri më vonë.</p>
        </div>
    )
}