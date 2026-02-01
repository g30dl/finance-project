import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback({ error: this.state.error, reset: this.handleReset })
          : fallback;
      }

      const isDev = Boolean(import.meta?.env?.DEV);
      const showDetails = isDev || this.state.errorCount > 2;

      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card">
            <h1 className="mb-2 text-center font-heading text-2xl text-foreground">
              Ocurrio un error inesperado
            </h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Puedes intentar nuevamente o recargar la aplicacion.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Intentar de nuevo
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Recargar aplicacion
              </button>
            </div>

            {showDetails && this.state.error ? (
              <details className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-destructive">
                  Detalles tecnicos
                </summary>
                <div className="mt-2 text-xs text-foreground/80">
                  <p className="font-semibold">{String(this.state.error)}</p>
                  {this.state.errorInfo?.componentStack ? (
                    <pre className="mt-2 whitespace-pre-wrap font-mono">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  ) : null}
                </div>
              </details>
            ) : null}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
