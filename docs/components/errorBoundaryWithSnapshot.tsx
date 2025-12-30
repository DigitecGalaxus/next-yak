"use client";
import { css } from "next-yak";
import { Component, ReactNode, createRef } from "react";

interface Props {
  fallback?: ReactNode;
  children?: ReactNode;
}

interface State {
  error: string | null;
  childSnapshot: string | null;
}

export class ErrorBoundaryWithSnapshot extends Component<Props, State> {
  state: State = {
    error: null,
    childSnapshot: null,
  };

  containerRef = createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  resetErrorBoundary() {
    this.setState({ error: null });
  }

  static getDerivedStateFromError(error: unknown) {
    if (error instanceof Error) {
      return { error: error.toString() };
    }
  }

  captureSnapshot() {
    if (this.containerRef.current) {
      this.setState({ childSnapshot: this.containerRef.current.innerHTML });
    }
  }

  componentDidMount() {
    // Capture initial snapshot after mount
    this.captureSnapshot();
  }

  componentDidUpdate(prevProps: Props) {
    // Update snapshot when children change and no error has occurred
    if (prevProps.children !== this.props.children && !this.state.error) {
      this.captureSnapshot();
    }

    // Reset error state if children change significantly
    if (prevProps.children !== this.props.children && !!this.state.error) {
      this.resetErrorBoundary();
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optional: log error or send to monitoring service
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (!!this.state.error) {
      // If we have a snapshot, use it; otherwise use fallback
      if (this.state.childSnapshot) {
        return (
          <div
            css={css`
              width: 100%;
              height: 100%;
            `}
          >
            <p>{this.state.error}</p>
            <div
              dangerouslySetInnerHTML={{ __html: this.state.childSnapshot }}
            />
          </div>
        );
      }
      return this.props.fallback;
    }

    // Render children inside a div to capture HTML
    return (
      <div
        ref={this.containerRef}
        css={css`
          width: 100%;
          height: 100%;
        `}
      >
        {this.props.children}
      </div>
    );
  }
}
