import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Evita la pantalla en blanco: si algo falla al renderizar, muestra el error real
// en vez de dejar la app vacía sin ninguna pista de qué ocurrió.
export default class ErrorBoundary extends React.Component<Props, State> {
  props: Props;
  state: State = { error: null };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error no controlado en la interfaz:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          maxWidth: 720, margin: "48px auto", padding: 24, fontFamily: "sans-serif",
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#1e3a8a", marginBottom: 8 }}>
            Ocurrió un error inesperado en la interfaz
          </h1>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>
            {this.state.error.message}
          </p>
          <pre style={{
            fontSize: 11, color: "#64748b", background: "#f8fafc", padding: 12,
            borderRadius: 8, overflowX: "auto", whiteSpace: "pre-wrap"
          }}>
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16, background: "#1d4ed8", color: "#fff", fontWeight: 700,
              fontSize: 12, padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer"
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
