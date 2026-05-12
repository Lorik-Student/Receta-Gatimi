import { Component, ReactNode } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

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
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <p>Diçka shkoi keq.</p>;
    }
    return this.props.children;
  }
}

export function ErrorPage() {
  const routeError = useRouteError();
  const isApiOffline =
    routeError instanceof Error &&
    routeError.message.toLowerCase().includes("api");

  let message = "Ndodhi një gabim. Ju lutemi provoni përsëri më vonë.";

  if (isRouteErrorResponse(routeError)) {
    message = `${routeError.status} ${routeError.statusText}`;
  } else if (routeError instanceof Error && routeError.message) {
    message = routeError.message;
  }

  if (isApiOffline) {
    message = "Nuk mund të lidhemi me backend-in. Sigurohuni që serveri API është i ndezur.";
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Obobo!</h1>
      <p>{message}</p>
    </div>
  );
}
