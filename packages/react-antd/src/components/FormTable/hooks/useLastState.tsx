import { useRef, useCallback } from "react";
export const useLastState = <T extends any>(state: T) => {
  const stateRef = useRef<T>(state);
  stateRef.current = state;

  const getLastState = useCallback(() => {
    return stateRef.current;
  }, []);

  return getLastState;
};
