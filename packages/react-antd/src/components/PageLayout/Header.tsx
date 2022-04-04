import React, { useContext } from "react";
import { Layout } from "antd";
import { MenuFoldOutlined } from "@ant-design/icons";
import { LayoutContext } from "./context";

const Header = ({ children }: { children?: React.ReactNode }) => {
  const { collapsed, trigger } = useContext(LayoutContext);
  return (
    <Layout.Header style={{ background: "white", paddingLeft: 24 }}>
      <MenuFoldOutlined onClick={() => trigger(!collapsed)} />
      {children}
    </Layout.Header>
  );
};

export default Header;
