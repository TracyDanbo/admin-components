import React from "react";

export const LayoutContext = React.createContext({
  collapsed: false,
  trigger: (value: boolean) => {
    console.log(value);
  },
});
