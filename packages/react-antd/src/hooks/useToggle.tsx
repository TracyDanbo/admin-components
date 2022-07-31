import { useCallback, useState } from "react";

export const useToggle = (
  initial: boolean
): [boolean, (value?: unknown) => void] => {
  const [visible, setVisible] = useState(initial);
  const toggle = useCallback((value: unknown) => {
    if (value == undefined || typeof value !== "boolean") {
      setVisible((state) => !state);
    } else {
      setVisible(!!value);
    }
  }, []);

  return [visible, toggle];
};
