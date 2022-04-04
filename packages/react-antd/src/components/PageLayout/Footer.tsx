import React from "react";
import { Layout } from "antd";
import "./styles.css";
const Footer = ({ children }: { children: React.ReactNode }) => {
  return <Layout.Footer className="footer">{children}</Layout.Footer>;
};

export default Footer;
