import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="font-heading text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">This screen could not load. The rest of the app is still available.</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => this.setState({ error: null })} className="h-12 rounded-xl bg-primary px-5 font-semibold text-primary-foreground">
            Try again
          </button>
          <Link to="/" className="flex h-12 items-center rounded-xl border border-border px-5 font-semibold">
            Home
          </Link>
        </div>
      </div>
    );
  }
}
