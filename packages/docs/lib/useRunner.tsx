import { Runner, RunnerOptions } from "@/components/runner";
import {
  useState,
  useRef,
  useEffect,
  createElement,
  ReactElement,
} from "react";

export type UseRunnerProps = RunnerOptions & {
  /** whether to cache previous element when error occurs with current code */
  disableCache?: boolean;
};

export type UseRunnerReturn = {
  element: ReactElement | null;
  error: string | null;
};

export const useRunner = ({
  code,
  scope,
  disableCache,
  transformFn,
}: UseRunnerProps): UseRunnerReturn => {
  const isMountRef = useRef(true);
  const elementRef = useRef<ReactElement | null>(null);

  const [state, setState] = useState<UseRunnerReturn>(() => {
    const element = createElement(Runner, {
      code,
      scope,
      transformFn,
      onRendered: (error) => {
        if (error) {
          setState({
            element: disableCache ? null : elementRef.current,
            error: error.toString(),
          });
        } else {
          elementRef.current = element;
        }
      },
    });
    isMountRef.current = false;
    return { element, error: null };
  });

  useEffect(() => {
    if (isMountRef.current) {
      return;
    }

    const element = createElement(Runner, {
      code,
      scope,
      transformFn,
      onRendered: (error) => {
        console.log("on rendered", { error });
        if (error) {
          setState({
            element: disableCache ? null : elementRef.current,
            error: error.toString(),
          });
        } else {
          elementRef.current = element;
        }
      },
    });
    setState({ element, error: null });
  }, [code, disableCache]);

  return state;
};
