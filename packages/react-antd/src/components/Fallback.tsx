import { Spin } from "antd";
import classNames from "classnames";
import { CSSProperties } from "react";

const Fallback = ({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) => {
  return (
    <div
      className={classNames(
        "flex w-full h-full items-center justify-center",
        className
      )}
      style={style}
    >
      <Spin size="large" />
    </div>
  );
};

export default Fallback;
