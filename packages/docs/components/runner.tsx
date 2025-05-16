import { executeCode } from "@/lib/execute-code";
import { Component, ReactElement } from "react";

type Scope = Record<string, any> & {
  /** scope used by import statement */
  import?: Record<string, any>;
};

export type RunnerOptions = {
  /** the code to run */
  code: string;
  /** globals that could be used in code */
  scope?: Scope;
  /** function to transform the code  */
  transformFn: Parameters<typeof executeCode>[0];
};

export type RunnerProps = RunnerOptions & {
  /** callback on code be rendered, returns error message when code is invalid */
  onRendered?: (error?: Error) => void;
};

type RunnerState = {
  element: ReactElement | null;
  error: Error | null;
  prevCode: string | null;
  prevScope: Scope | undefined;
  isLoading: boolean;
};

export class Runner extends Component<RunnerProps, RunnerState> {
  state: RunnerState = {
    element: null,
    error: null,
    prevCode: null,
    prevScope: undefined,
    isLoading: false,
  };

  // Remove getDerivedStateFromProps as it doesn't support async operations

  componentDidMount() {
    this.regenerateElement();
  }

  componentDidUpdate(prevProps: RunnerProps) {
    // Only regenerate on code/scope change
    if (
      prevProps.code !== this.props.code ||
      prevProps.scope !== this.props.scope
    ) {
      this.regenerateElement();
    }
  }

  async regenerateElement() {
    const { code, scope } = this.props;

    // Set loading state
    this.setState({ isLoading: true });

    try {
      // Await the async generateElement function
      // const element = await generateElement({ code, scope });
      const element = await executeCode(
        this.props.transformFn,
        this.props.code,
        this.props.scope ?? {},
      );

      console.log("here");

      this.setState(
        {
          element,
          error: null,
          prevCode: code,
          prevScope: scope,
          isLoading: false,
        },
        () => {
          // Call onRendered in the setState callback to ensure state is updated
          this.props.onRendered?.(undefined);
        },
      );
    } catch (error: unknown) {
      console.log("here with error");
      this.setState(
        {
          element: null,
          error: error as Error,
          prevCode: code,
          prevScope: scope,
          isLoading: false,
        },
        () => {
          this.props.onRendered?.(this.state.error ?? undefined);
        },
      );
    }
  }

  static getDerivedStateFromError(error: Error): Partial<RunnerState> {
    return { error, isLoading: false };
  }

  shouldComponentUpdate(nextProps: RunnerProps, nextState: RunnerState) {
    return (
      nextProps.code !== this.props.code ||
      nextProps.scope !== this.props.scope ||
      nextState.error !== this.state.error ||
      nextState.isLoading !== this.state.isLoading
    );
  }

  render() {
    if (this.state.isLoading) {
      // Optionally render a loading indicator
      return null; // or return <LoadingIndicator />;
    }

    return this.state.error ? null : this.state.element;
  }
}
