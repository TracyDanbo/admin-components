import { Route, MakeGenerics } from "react-location";
export type LocationGenerics = MakeGenerics<{
  RouteMeta: {
    name: string;
    icon?: JSX.Element;
  };
}>;
