import React, { useCallback, useState } from "react";
import { Layout } from "antd";
import Footer from "./Footer";
import Header from "./Header";
import Sider from "./Sider";
import Breadcrumb from "./Breadcrumb";
import { LayoutContext } from "@/context";
import logo from "@/assets/images/logo-footer.png";

const Main = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout>
      <Header />
      <Breadcrumb />
      <Layout.Content>{children}</Layout.Content>
      <Footer>
        <div className="footer-content">
          <img src={logo} alt="company logo and name" />
          Copyright 2022 广东省重工建筑设计院有限公司版权所有
        </div>
      </Footer>
    </Layout>
  );
};

const Frame = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const trigger = useCallback((collapsed) => {
    setCollapsed(collapsed);
  }, []);

  return (
    <LayoutContext.Provider value={{ collapsed, trigger }}>
      <Layout style={{ minHeight: "100vh" }} hasSider>
        <Sider />
        {children}
      </Layout>
    </LayoutContext.Provider>
  );
};

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Frame>
      <Main>{children}</Main>
    </Frame>
  );
};

export default PageLayout;
