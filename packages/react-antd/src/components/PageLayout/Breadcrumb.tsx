import React from "react";
import { Breadcrumb as AntdBreadcrumb } from "antd";
import {
  Link,
  // MakeGenerics,
  // Outlet,
  // ReactLocation,
  // Router,
  // useMatch,
  useMatches,
} from "react-location";
import { LocationGenerics } from "./types";
const Breadcrumb = () => {
  const matches = useMatches<LocationGenerics>();
  return (
    <AntdBreadcrumb style={{ margin: "16px 0" }}>
      {matches
        .filter((match) => match.route?.meta)
        .map((match, index) => (
          <AntdBreadcrumb.Item key={index}>
            <Link to={match.route.path}>{match.route.meta?.name}</Link>
          </AntdBreadcrumb.Item>
        ))}
    </AntdBreadcrumb>
  );
};

export default Breadcrumb;
