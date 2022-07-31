import React, { useEffect, useState } from "react";
import {
  Cascader,
  DatePicker,
  Input,
  Select,
  TimePicker,
  TagProps,
  InputNumberProps,
  SwitchProps,
  TooltipProps,
  AvatarProps,
} from "antd";
import { FieldMap, FieldProps, InputTypes, Option, CellType } from "../types";
import {
  AvatarCell,
  DefaultCell,
  ImageCell,
  LongTextCell,
  NumberInputCell,
  PriceCell,
  SwitchCell,
  TagCell,
} from "./CellComponents";

const FormSelect = ({
  valueEnum,
  options: ops,
  request,
  inputProps,
  ...otherProps
}: FieldProps) => {
  const [options, setOptions] = useState<Option[]>(() => {
    if (valueEnum) {
      return Object.entries(valueEnum).map(([key, value]) => ({
        label: value,
        value: key,
      }));
    } else if (ops) {
      return ops;
    }
    return [];
  });

  useEffect(() => {
    if (request) {
      request().then(({ data }) => {
        setOptions(data);
      });
    }
  }, []);

  return (
    <Select allowClear {...otherProps} {...inputProps} options={options} />
  );
};

const FormCascader = ({
  request,
  options: ops,
  inputProps,
  valueEnum,
  ...otherProps
}: FieldProps) => {
  const [options, setOptions] = useState(ops ? ops : []);
  useEffect(() => {
    if (request) {
      request().then(({ data }) => {
        setOptions(data);
      });
    }
  }, []);
  return <Cascader {...otherProps} {...inputProps} options={options} />;
};

export const defaultFieldMap: FieldMap = {
  [InputTypes.INPUT]: {
    renderFormItem: ({
      valueEnum,
      options,
      request,
      inputProps,
      ...others
    }) => {
      return <Input {...others} {...inputProps} />;
    },
  },
  [InputTypes.SELECT]: {
    renderFormItem: FormSelect,
  },
  [InputTypes.CASCADER]: {
    renderFormItem: FormCascader,
  },
  [InputTypes.DATE]: {
    renderFormItem: ({
      valueEnum,
      options,
      request,
      inputProps,
      ...others
    }) => {
      return <DatePicker {...others} {...inputProps} />;
    },
  },
  [InputTypes.DATERANGE]: {
    renderFormItem: ({
      valueEnum,
      options,
      request,
      inputProps,
      ...others
    }) => {
      return <DatePicker.RangePicker {...others} {...inputProps} />;
    },
  },
  [InputTypes.DATETIME]: {
    renderFormItem: ({
      valueEnum,
      options,
      request,
      inputProps,
      ...others
    }) => {
      return (
        <DatePicker.RangePicker
          showTime={{ format: "HH:mm" }}
          {...others}
          {...inputProps}
        />
      );
    },
  },
  [InputTypes.TIME]: {
    renderFormItem: ({
      valueEnum,
      options,
      request,
      inputProps,
      ...others
    }) => {
      return <TimePicker {...others} {...inputProps} />;
    },
  },
  [InputTypes.TIMERANGE]: {
    renderFormItem: ({
      valueEnum,
      options,
      request,
      inputProps,
      ...others
    }) => {
      return <TimePicker.RangePicker {...others} {...inputProps} />;
    },
  },
};

export type InputOptions = {
  props:
    | Omit<TagProps, "icon">
    | Omit<InputNumberProps, "onChange">
    | Omit<SwitchProps, "onChange">
    | TooltipProps
    | AvatarProps;
  action: () => Promise<{
    error: Error | null;
    success: { message: string } | null;
  }>;
};

export const defaultCellMap: Record<
  string,
  {
    render: (props: any) => JSX.Element;
  }
> = {
  [CellType.LongText]: {
    render: LongTextCell,
  },
  [CellType.Tag]: {
    render: TagCell,
  },

  [CellType.Image]: {
    render: ImageCell,
  },
  [CellType.Avatar]: {
    render: AvatarCell,
  },
  [CellType.NumberInput]: {
    render: NumberInputCell,
  },
  [CellType.Switch]: {
    render: SwitchCell,
  },
  [CellType.Money]: {
    render: PriceCell,
  },
  [CellType.Default]: {
    render: DefaultCell,
  },
};
