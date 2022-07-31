import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Typography,
} from "antd";
import { TooltipPropsWithTitle } from "antd/lib/tooltip";
import "./styles.css";
import { nanoid } from "nanoid";
import { priceFormat } from "../utils/format";

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
  const defaultCheckedRef = useRef(others.defaultChecked);
  const timer = useRef<NodeJS.Timeout | undefined>(undefined);
  const [key, setKey] = useState(nanoid());
  const _onChange = useCallback(
    (checked: boolean) => {
      if (!onChange) return;
      if (checked === defaultCheckedRef.current) return;
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = undefined;
      }
      timer.current = setTimeout(async () => {
        setLoading(true);
        const res = await onChange(checked, record);
        setLoading(false);
        if (res.error) {
          setKey(nanoid());
          message.error(res.error.message);
        } else {
          defaultCheckedRef.current = checked;
          message.success(res.success.message);
        }
      }, 500);
    },
    [onChange, record]
  );
  useEffect(() => {
    if (others.defaultChecked !== defaultCheckedRef.current) {
      defaultCheckedRef.current = others.defaultChecked;
      setKey(nanoid());
    }
  }, [others.defaultChecked]);
  return (
    <Switch key={key} {...others} onChange={_onChange} loading={loading} />
  );
};

interface NumberInputCellProps extends Omit<InputNumberProps, "onPressEnter"> {
  onPressEnter: (
    value: number | string | null,
    record: any
  ) => Promise<{ error: Error; success: { message: string } }>;
  validate?: (value: number) => boolean;
  record: any;
}

export const NumberInputCell = ({
  onPressEnter,
  record,
  validate,
  ...others
}: NumberInputCellProps) => {
  const [loading, setLoading] = useState(false);
  const update = useCallback(
    async (e: any) => {
      const { value, defaultValue } = others;
      if (e.target.value === defaultValue || e.target.value === value) return;
      if (validate && !validate(e.target.value)) return;
      setLoading(true);
      const { min, max } = others;
      let updateValue = e.target.value;
      if (min !== undefined && min !== null && min > updateValue) {
        updateValue = min;
      }
      if (max !== undefined && max !== null && max < updateValue) {
        updateValue = max;
      }
      const res = await onPressEnter(updateValue, record);
      setLoading(false);
      if (res.error) {
        message.error(res.error.message);
      } else {
        message.success(res.success.message);
      }
    },
    [record, onPressEnter, validate, others]
  );

  return (
    <Spin spinning={loading}>
      <InputNumber {...others} onPressEnter={update} onBlur={update} />
    </Spin>
  );
};

interface LongTextCellProps extends TooltipPropsWithTitle {
  copy?: string;
  value?: string;
}

export const LongTextCell = ({
  title,
  copy,
  value,
  ...others
}: LongTextCellProps) => {
  if (value == undefined) return <span>--</span>;
  if (!title) return <span>{value}</span>;
  let component = null;
  if (typeof title === "function") {
    component = value ? value : title();
  } else {
    component = value ? value : title;
  }

  return (
    <Tooltip title={title} {...others}>
      <Typography.Text
        copyable={copy ? { text: copy } : false}
        className="flex"
      >
        <div className="ellipsis">
          <span>{component}</span>
        </div>
      </Typography.Text>
    </Tooltip>
  );
};

export const DefaultCell = ({
  value,
  ...others
}: {
  value: string | number;
}) => {
  return <span {...others}>{value ?? "--"}</span>;
};

export const PriceCell = ({ value, ...others }: { value: string | number }) => {
  return <span {...others}>{priceFormat(value)}</span>;
};

interface ImageCellProps extends ImageProps {
  defaultValue: string;
}

export const ImageCell = ({ defaultValue, src, ...others }: ImageCellProps) => {
  const imgUrl = src || defaultValue;
  if (!imgUrl) return <span>--</span>;
  return <Image src={imgUrl} {...others} />;
};

interface AvatarCellProps extends AvatarProps {
  defaultValue: string;
}

export const AvatarCell = ({
  defaultValue,
  src,
  ...others
}: AvatarCellProps) => {
  const imgUrl = src || defaultValue;
  if (!imgUrl) return <span>--</span>;
  return <Avatar shape="circle" src={imgUrl} {...others} />;
};

export const TagCell = ({ children, ...others }: TagProps) => {
  return <Tag {...others}>{children}</Tag>;
};
