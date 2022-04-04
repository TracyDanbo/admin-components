import {
  AvatarProps,
  CascaderProps,
  DatePickerProps,
  ImageProps,
  InputNumberProps as AntdInputNumberProps,
  InputProps,
  SelectProps,
  SwitchProps as AntdSwitchProps,
  TagProps,
  TimePickerProps,
  TimeRangePickerProps,
} from "antd";
import { DefaultOptionType as CascaderOption } from "antd/lib/cascader";
import { DefaultOptionType as SelectOption } from "antd/lib/select";
import { RangePickerProps } from "antd/lib/date-picker";
import { Rule } from "antd/lib/form";
import { NamePath } from "antd/lib/form/interface";
import { ColumnType, TablePaginationConfig } from "antd/lib/table";

import { CellProps, Column as ReactTableColumn, Renderer } from "react-table";
import { FilterValue, SorterResult } from "antd/lib/table/interface";

export type VirtualColumn<T extends object> = ReactTableColumn<T> & {
  form?: Field;
  Cell?: Renderer<CellProps<T>> | Cell | undefined;
};

export type ParamsType<T> = {
  pagination: Pick<TablePaginationConfig, "current" | "pageSize">;
  sorter?: Record<string, string> | SorterResult<T> | SorterResult<T>[];
  filters?: Record<string, string> | Record<string, FilterValue | null>;
  query?: Record<string, any>;
};

export enum CellType {
  LongText = "LongText",
  Tag = "Tag",
  Money = "Money",
  Default = "Default",
  Image = "Image",
  Avatar = "Avatar",
  NumberInput = "NumberInput",
  Switch = "Switch",
}

export enum InputTypes {
  INPUT = "input",
  SELECT = "select",
  CASCADER = "cascader",
  DATERANGE = "dateRange",
  DATETIME = "dateTime",
  DATE = "date",
  TIME = "time",
  TIMERANGE = "timeRange",
}
export type Option = CascaderOption | SelectOption;
type BaseField = {
  name: NamePath;
  label: React.ReactNode;
  rules?: Rule[];
};

type InputField = BaseField & {
  type: InputTypes.INPUT;
  inputProps?: InputProps;
};
type SelectField = BaseField & {
  type: InputTypes.SELECT;
  inputProps?: Omit<SelectProps, "options">;
  valueEnum?: Record<string, string>;
  options?: Option[];
  request?: () => Promise<{ data: Option[] }>;
};

type CascaderField = BaseField & {
  type: InputTypes.CASCADER;
  inputProps?: Omit<CascaderProps<any>, "options">;
  options?: Option[];
  request?: () => Promise<{ data: Option[] }>;
};

type DateField = BaseField & {
  type: InputTypes.DATE;
  inputProps?: DatePickerProps;
};

type DateRangeField = BaseField & {
  type: InputTypes.DATERANGE;
  inputProps?: RangePickerProps;
};

type DateTimeField = BaseField & {
  type: InputTypes.DATETIME;
  inputProps?: DatePickerProps;
};

type TimeField = BaseField & {
  type: InputTypes.TIME;
  inputProps?: TimePickerProps;
};

type TimeRangeField = BaseField & {
  type: InputTypes.TIMERANGE;
  inputProps?: TimeRangePickerProps;
};

export type DefaultField =
  | InputField
  | SelectField
  | CascaderField
  | DateRangeField
  | DateTimeField
  | DateField
  | TimeField
  | TimeRangeField;
export type CustomField = {
  customType: string;
  name: NamePath;
  label: React.ReactNode;
  valueEnum?: Record<string, string>;
  options?: Option[];
  request?: () => Promise<{ data: Option[] }>;
  rules?: Rule[];
  inputProps?: object;
};
type CellAction = (...args: any[]) => Promise<{
  error: Error | null;
  success: { message: string } | null;
}>;

interface InputNumberProps extends AntdInputNumberProps {
  onPressEnter: CellAction;
}

interface SwitchProps extends Omit<AntdSwitchProps, "checked"> {
  onChange: CellAction;
}

export type NumberInputCell = {
  type: CellType.NumberInput;
  createProps?: (
    text: string | number | boolean,
    record: any,
    index: number
  ) => InputNumberProps;
};

export type TagCell = {
  type: CellType.Tag;
  createProps?: (
    text: string | number | boolean,
    record: any,
    index: number
  ) => TagProps;
};

export type SwitchCell = {
  type: CellType.Switch;
  createProps?: (
    text: string | number | boolean,
    record: any,
    index: number
  ) => SwitchProps;
};
export type ImageCell = {
  type: CellType.Image;
  createProps?: (
    text: string | number | boolean,
    record: any,
    index: number
  ) => ImageProps;
};
export type AvatarCell = {
  type: CellType.Avatar;
  createProps?: (
    text: string | number | boolean,
    record: any,
    index: number
  ) => AvatarProps;
};

export type TextCell = {
  type: CellType.LongText | CellType.Default | CellType.Money;
  createProps?: (
    text: string | number | boolean,
    record: any,
    index: number
  ) => object;
};

export type CustomCell = {
  customType: string;
  createProps?: (
    text: string | number | boolean,
    record: any,
    index: number
  ) => object;
};

export type DefaultCell =
  | TagCell
  | NumberInputCell
  | SwitchCell
  | TextCell
  | ImageCell
  | AvatarCell;
export type Field = DefaultField | CustomField;
export type Cell = DefaultCell | CustomCell;
export interface NormalColumn<T> extends ColumnType<T> {
  dataIndex: NamePath;
  form?: Field;
  cell?: Cell;
  children?: NormalColumn<T>[];
}

export type FieldProps = {
  inputProps?: any;
  valueEnum?: Record<string, string>;
  options?: Option[];
  request?: () => Promise<{ data: Option[] }>;
  value: any;
  onChange: (value: any) => void;
};

export type FieldMap = {
  [key: string]: {
    renderFormItem: (props: FieldProps) => JSX.Element;
  };
};

export type CellMap = {
  [key: string]: {
    render: (props: any) => JSX.Element;
    createProps?: (
      text: string | number | boolean,
      record: any,
      index: number
    ) => object;
  };
};

export type TableDataResponse<T> = Promise<{
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  success: boolean;
}>;

export type FormTableOption<T extends object> = {
  columns: NormalColumn<T>[] | VirtualColumn<T>[];
  request: (params?: ParamsType<T>) => TableDataResponse<T>;
  customFields?: FieldMap;
  customCells?: CellMap;
  stateReducer?: (state: any, action: any) => any;
  initialValue?: any;
  type?: "normal" | "virtual";
  indexColumn?: boolean;
};

export type Action = { type: string; payload?: any };
export type Reducer = <S>(state: S, action: Action) => S;
