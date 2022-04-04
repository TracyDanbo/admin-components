import React, { useContext, useMemo, useCallback } from "react";
import { Layout, Menu } from "antd";

import { LayoutContext } from "./context";
import { LocationGenerics } from "./types";
import { Link, Route, useMatch, useRouter } from "react-location";

const Menus = ({ routes }: { routes: Route<LocationGenerics>[] }) => {
  const getMenus = useCallback(
    (routes: Route<LocationGenerics>[], component: typeof Menu.Item) => {
      return (
        <>
          {routes.map((route) => {
            if (route.children) {
              return (
                <Menu.SubMenu
                  key={route.id}
                  eventKey={route.id}
                  title={route.meta?.name}
                  icon={route.meta?.icon}
                >
                  {getMenus(route.children, Menu.Item)}
                </Menu.SubMenu>
              );
            }
            const Component = component;
            return (
              <Component
                key={route.id}
                eventKey={route.id}
                title={route.meta?.name}
                icon={route.meta?.icon}
              >
                <Link to={route.id}>{route.meta?.name}</Link>
              </Component>
            );
          })}
        </>
      );
    },
    []
  );
  const menus = useMemo(() => {
    return getMenus(routes, Menu.Item);
  }, [routes, getMenus]);
  return menus;
};

const Sider = () => {
  const { routes } = useRouter<LocationGenerics>();
  const { collapsed } = useContext(LayoutContext);
  const match = useMatch<LocationGenerics>();
  return (
    <Layout.Sider
      collapsed={collapsed}
      collapsible
      collapsedWidth={60}
      width={256}
      trigger={null}
      theme="light"
      style={{
        height: "100vh",
        overflow: "auto",
      }}
    >
      <div className="logo" />
      <Menu
        theme="light"
        defaultSelectedKeys={[match.pathname]}
        mode="inline"
        onSelect={(e) => {
          console.log(e);
        }}
        style={{
          overflow: "auto",
        }}
      >
        <Menus routes={routes} />
      </Menu>
    </Layout.Sider>
  );
};

export default Sider;
