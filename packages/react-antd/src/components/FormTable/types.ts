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
import { ColumnType } from "antd/lib/table";

import { CellProps, Column as ReactTableColumn, Renderer } from "react-table";
import { FilterValue, SorterResult } from "antd/lib/table/interface";

export type VirtualColumn<T extends object> = ReactTableColumn<T> & {
  form?: Field;
  Cell?: Renderer<CellProps<T>> | Cell | undefined;
};

export type ParamsType<P, T> = {
  pagination: {
    current: number;
    pageSize: number;
  };
  sorter?: Record<string, string> | SorterResult<T> | SorterResult<T>[];
  filters?: Record<string, string> | Record<string, FilterValue | null>;
  query?: P;
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
export type BaseField = {
  name: NamePath;
  label: React.ReactNode;
  rules?: Rule[];
};

export type InputField = BaseField & {
  type: InputTypes.INPUT;
  inputProps?: InputProps;
};
export type SelectField = BaseField & {
  type: InputTypes.SELECT;
  inputProps?: Omit<SelectProps, "options">;
  valueEnum?: Record<string, string>;
  options?: Option[];
  request?: (
    controller: AbortController
  ) => Promise<{ data: Option[]; success: boolean }>;
};

export type CascaderField = BaseField & {
  type: InputTypes.CASCADER;
  inputProps?: Omit<CascaderProps<any>, "options">;
  options?: Option[];
  request?: (
    controller: AbortController
  ) => Promise<{ data: Option[]; success: boolean }>;
};

export type DateField = BaseField & {
  type: InputTypes.DATE;
  inputProps?: DatePickerProps;
};

export type DateRangeField = BaseField & {
  type: InputTypes.DATERANGE;
  inputProps?: RangePickerProps;
};

export type DateTimeField = BaseField & {
  type: InputTypes.DATETIME;
  inputProps?: DatePickerProps;
};

export type TimeField = BaseField & {
  type: InputTypes.TIME;
  inputProps?: TimePickerProps;
};

export type TimeRangeField = BaseField & {
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
  request?: (
    controller: AbortController
  ) => Promise<{ data: Option[]; success: boolean }>;
  rules?: Rule[];
  inputProps?: object;
};
export type CellAction = (...args: any[]) => Promise<{
  error?: Error;
  success?: { message: string };
}>;

interface InputNumberProps extends AntdInputNumberProps {
  onPressEnter: CellAction;
}

export interface SwitchProps extends Omit<AntdSwitchProps, "checked"> {
  onChange: CellAction;
}

export type CreatePropsParamsType = {
  text: string | number | boolean;
  record: any;
  index: number;
  dispatch: React.Dispatch<Action>;
};

export type CustomCell = {
  customType: string;
  createProps?: (params: CreatePropsParamsType) => object;
};

export type NumberInputCell = {
  type: CellType.NumberInput;
  createProps?: (params: CreatePropsParamsType) => InputNumberProps;
};

export type TagCell = {
  type: CellType.Tag;
  createProps?: (params: CreatePropsParamsType) => TagProps;
};

export type SwitchCell = {
  type: CellType.Switch;
  createProps?: (params: CreatePropsParamsType) => SwitchProps;
};
export type ImageCell = {
  type: CellType.Image;
  createProps?: (params: CreatePropsParamsType) => ImageProps;
};
export type AvatarCell = {
  type: CellType.Avatar;
  createProps?: (params: CreatePropsParamsType) => AvatarProps;
};

export type TextCell = {
  type: CellType.LongText | CellType.Default | CellType.Money;
  createProps?: (params: CreatePropsParamsType) => object;
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
export interface NormalColumn<T> extends Omit<ColumnType<T>, "render"> {
  dataIndex: NamePath;
  form?: Field;
  cell?:
    | TagCell
    | NumberInputCell
    | SwitchCell
    | TextCell
    | ImageCell
    | AvatarCell
    | CustomCell;
  children?: NormalColumn<T>[];
  render?: (params: {
    text: any;
    record: T;
    index: number;
    dispatch: React.Dispatch<Action>;
  }) => JSX.Element;
}

export type FieldProps = {
  inputProps?: any;
  valueEnum?: Record<string, string>;
  options?: Option[];
  request?: (
    controller: AbortController
  ) => Promise<{ data: Option[]; success: boolean }>;
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
    createProps?: (params: CreatePropsParamsType) => object;
  };
};

export type TableDataResponse<T> = Promise<{
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  success: boolean;
}>;

export type FormTableState<T extends object> = {
  data: T[];
  pagination: {
    current: number;
    defaultCurrent: number;
    defaultPageSize: number;
    pageSize: number;
    pageSizeOptions: [10, 20, 50, 100];
    total: number;
  };
  query: undefined;
  status: actionType;
  columns: NormalColumn<T>[] | VirtualColumn<T>[];
  customCells: FieldMap;
  customFields: CellMap;
};

export type FormTableOption<T extends object, P = T> = {
  columns: NormalColumn<T>[] | VirtualColumn<T>[];
  request: RequestFunType<P, T>;
  customFields?: FieldMap;
  customCells?: CellMap;
  stateReducer?: (state: any, action: any) => any;
  initialValue?: any;
  type?: "normal" | "virtual";
  indexColumn?: boolean;
  pagination?: {
    defaultCurrent?: number;
    defaultPageSize?: number;
    pageSize?: number;
    pageSizeOptions?: number[];
  };
};

export enum actionType {
  success = "success",
  failed = "failed",
  loading = "loading",
  idle = "idle",
}

export type RequestFunType<P, T> = (
  params: ParamsType<P, T>,
  controller: AbortController
) => TableDataResponse<T>;

export type Action = { type: string; payload?: any };
export type Reducer = <S>(state: S, action: Action) => S;
