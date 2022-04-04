import React, { useCallback, useRef, useState } from "react";
import {
  Switch,
  SwitchProps,
  message,
  InputNumber,
  InputNumberProps,
  Spin,
  Tooltip,
  ImageProps,
  Image,
  Avatar,
  AvatarProps,
  Tag,
  TagProps,
} from "antd";
import { TooltipPropsWithTitle } from "antd/lib/tooltip";

type CellProps = {
  defaultValue: string | number | boolean;
  index: number;
  record: any;
};

interface SwitchCellProps extends Omit<SwitchProps, "loading" | "checked"> {
  onChange: (
    checked: boolean,
    record: any
  ) => Promise<{ error: Error; success: { message: string } }>;
  record: any;
}

export const SwitchCell = ({
  record,
  onChange,
  ...others
}: SwitchCellProps) => {
  const [loading, setLoading] = useState(false);
  const timer = useRef<NodeJS.Timeout | undefined>(undefined);
  const _onChange = useCallback(
    (checked) => {
      if (!onChange) return;
      if (checked === others.defaultChecked) return;
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(async () => {
        setLoading(true);
        const res = await onChange(checked, record);
        setLoading(false);
        if (res.error) {
          message.error(res.error.message);
        } else {
          message.success(res.success.message);
        }
      }, 300);
    },
    [onChange]
  );
  return <Switch {...others} onChange={_onChange} loading={loading} />;
};

interface NumberInputCellProps extends Omit<InputNumberProps, "onPressEnter"> {
  onPressEnter: (
    value: number | string | null,
    record: any
  ) => Promise<{ error: Error; success: { message: string } }>;
  record: any;
}

export const NumberInputCell = ({
  onPressEnter,
  record,
  ...others
}: NumberInputCellProps) => {
  const [loading, setLoading] = useState(false);
  const update = useCallback(
    async (e) => {
      const { value, defaultValue } = others;
      if (e.target.value === defaultValue || e.target.value === value) return;
      setLoading(true);
      const res = await onPressEnter(e.target.value, record);
      setLoading(false);
      if (res.error) {
        message.error(res.error.message);
      } else {
        message.success(res.success.message);
      }
    },
    [record]
  );

  return (
    <Spin spinning={loading}>
      <InputNumber {...others} onPressEnter={update} onBlur={update} />
    </Spin>
  );
};

export const LongTextCell = ({ title, ...others }: TooltipPropsWithTitle) => {
  return title ? (
    <Tooltip title={title} {...others}>
      <span>{title}</span>
    </Tooltip>
  ) : (
    <span>--</span>
  );
};

export const DefaultCell = ({
  value,
  ...others
}: {
  value: string | number;
}) => {
  return <span {...others}>{value ? value : "--"}</span>;
};

export const PriceCell = ({ value, ...others }: { value: string | number }) => {
  return (
    <span {...others}>{`¥${parseFloat(value as string).toFixed(2)}`}</span>
  );
};

interface ImageCellProps extends ImageProps {
  defaultValue: string;
}

export const ImageCell = ({ defaultValue, ...others }: ImageCellProps) => {
  return <Image src={defaultValue} {...others} />;
};

interface AvatarCellProps extends AvatarProps {
  defaultValue: string;
}

export const AvatarCell = ({ defaultValue, ...others }: AvatarCellProps) => {
  return <Avatar shape="circle" src={defaultValue} {...others} />;
};

export const TagCell = ({ children, ...others }: TagProps) => {
  return <Tag {...others}>{children}</Tag>;
};
