import {
  useReducer,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useContext,
} from "react";
import { defaultCellMap } from "../components/FieldComponents";
import {
  Field,
  NormalColumn,
  FormTableOption,
  ParamsType,
  CellMap,
  DefaultCell,
  CustomCell,
  Cell,
  Action,
} from "../types";
import { getCellprops } from "../utils/cellConstrutor";
import { DefaultCell as DefaultCellComponent } from "../components/CellComponents";
import { ColumnType, TablePaginationConfig, TableProps } from "antd/lib/table";
import { useLastState } from "./useLastState";
import {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from "antd/lib/table/interface";
import { Form } from "antd";
import { CustomConfigContext } from "../components/ConfigProvider";
import { nanoid } from "nanoid";

enum actionType {
  success = "success",
  failed = "failed",
  loading = "loading",
  idle = "idle",
}

const defaultInitialState = {
  data: [],
  pagination: {
    current: 1,
    defaultCurrent: 1,
    defaultPageSize: 20,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    total: 0,
  },
  query: undefined,
  status: actionType.idle,
  columns: [],
  customCells: {},
  customFields: {},
};

const defaultStateReducer = (
  state: typeof defaultInitialState,
  action: Action
) => {
  switch (action.type) {
    case actionType.loading: {
      const {
        pagination = {
          current: state.pagination.current,
          pageSize: state.pagination.pageSize,
        },
        query = state.query,
      } = action.payload || {};

      return {
        ...state,
        status: actionType.loading,
        pagination: {
          ...state.pagination,
          ...pagination,
        },
        query: query,
      };
    }

    case actionType.success: {
      const {
        data,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        success,
        page: current,
        count: pageSize,
        ...pagination
      } = action.payload;
      return {
        ...state,
        data: data.map((item: any, index: number) => ({
          ...item,
          _index: index + 1,
          rowKey: nanoid(),
        })),
        pagination: {
          ...state.pagination,
          current,
          pageSize,
          ...pagination,
        },
        status: actionType.success,
      };
    }
    case actionType.failed: {
      return {
        ...state,
        status: actionType.failed,
      };
    }
    default:
      return state;
  }
};

const getNormalColumn = <T extends object>(
  columns: NormalColumn<T>[],
  cellMaps: CellMap,
  dispatch: React.Dispatch<Action>
): ColumnType<T>[] => {
  return columns.map((column) => {
    const {
      title,
      dataIndex,
      render: customRender,
      cell,
      // form,
      ...others
    } = column;
    const type =
      (cell as DefaultCell)?.type || (cell as CustomCell)?.customType;
    const _render = cellMaps[type]?.render;
    let render = undefined;
    if (customRender) {
      render = (text: any, record: T, index: number) => {
        return customRender({
          text,
          record,
          index,
          dispatch,
        });
      };
      // render = customRender;
    } else {
      render = (
        text: string,
        record: Record<string, unknown>,
        index: number
      ) => {
        const props = getCellprops(
          text,
          record,
          index,
          cell as Cell,
          dispatch,
          cellMaps[type]?.createProps
        );
        const CellComponent = _render || DefaultCellComponent;
        return <CellComponent {...props} />;
      };
    }
    const shouldCellUpdate = (record: any, preRecord: any) => {
      if (typeof dataIndex === "string" || typeof dataIndex === "number") {
        return record[dataIndex] !== preRecord[dataIndex];
      } else if (Array.isArray(dataIndex)) {
        let now = record;
        dataIndex.forEach((item) => (now = now[item]));
        let pre = preRecord;
        dataIndex.forEach((item) => (pre = pre[item]));
        return now !== pre;
      }
    };
    let children;
    if (column.children) {
      children = getNormalColumn(column.children, cellMaps, dispatch);
    }

    return {
      title,
      dataIndex,
      render,
      align: "center",
      shouldCellUpdate,
      children,
      ...others,
    } as ColumnType<T>;
  });
};

const combineReducer = (...args: typeof defaultStateReducer[]) => {
  return (state: typeof defaultInitialState, action: Action) => {
    let localState = state;
    args.forEach((reducer) => {
      localState = reducer(localState, action);
    });
    return localState;
  };
};

const normalIndexColumn = [
  {
    title: "序号",
    dataIndex: "_index",
    width: 60,
    align: "center",
  },
];

const showTotal = (total: number, range: number[]) => {
  const [begin, end] = range;
  return `第 ${begin}-${end}条/总共 ${total} 条`;
};

export const useAntdFormTable = <T extends object, P = T>({
  request: userRequest,
  stateReducer: userReducer,
  columns: userColumns,
  customCells,
  customFields,
  columns,
  indexColumn = true,
  pagination,
}: FormTableOption<T, P>) => {
  const { customFields: globalCustomFields, customCells: globalCustomCells } =
    useContext(CustomConfigContext);
  const initialValue = Object.assign(defaultInitialState, {
    columns,
    customFields: Object.assign({}, globalCustomFields, customFields),
    customCells: Object.assign({}, globalCustomCells, customCells),
    // pagination,
    ...(pagination ? { pagination } : {}),
  });
  const stateReducer = userReducer
    ? combineReducer(defaultStateReducer, userReducer)
    : defaultStateReducer;
  const [state, dispatch] = useReducer(stateReducer, initialValue);
  const request = useRef(userRequest);
  const tableRef = useRef(null);
  // const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();
  const controllerRef = useRef<AbortController | undefined>();
  const getLastState = useLastState(state);

  const fetchTableData = useCallback(async (params: ParamsType<P, T>) => {
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    const res = await request.current(params, controllerRef.current);
    if (res.success) {
      dispatch({ type: actionType.success, payload: res });
    } else {
      if (!controllerRef.current.signal.aborted) {
        dispatch({ type: actionType.failed, payload: res });
      }
    }
  }, []);

  const cellMaps = useMemo(() => {
    const { customCells } = getLastState();
    return Object.assign({}, defaultCellMap, customCells);
  }, [getLastState]);

  const fieldColumns = useMemo(() => {
    const fields: Field[] = [];
    const normalColums: NormalColumn<T>[] = [];
    // const virtualColums: VirtualColumn<T>[] = [];
    userColumns.forEach((column) => {
      const { form, ...others } = column;
      if (form) {
        fields.push(form);
      }
      normalColums.push(others as NormalColumn<T>);
    });
    return { fields, normalColums };
  }, [userColumns]);

  const normalColums = useMemo(() => {
    const { normalColums } = fieldColumns;
    const columns = indexColumn
      ? (normalIndexColumn as ColumnType<T>[]).concat(
          getNormalColumn(normalColums, cellMaps, dispatch)
        )
      : getNormalColumn(normalColums, cellMaps, dispatch);
    return columns;
  }, [fieldColumns, cellMaps, indexColumn]);

  const getNormalTableProps = useCallback(
    (props?: TableProps<T>) => {
      const { pagination, data, status, query: requestQuery } = getLastState();
      const loading = status === actionType.loading;
      const onChange: (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<T> | SorterResult<T>[],
        extra: TableCurrentDataSource<T>
      ) => void = (pagination, filters, sorter) => {
        const { current, pageSize } = pagination;
        // fetchTableData({ pagination: { current, pageSize }, sorter, filters });
        dispatch({
          type: actionType.loading,
          payload: {
            pagination: { current, pageSize },
            sorter,
            filters,
            query: requestQuery?.query,
          },
        });
      };
      const scroll = {
        x: normalColums.length * 150,
      };

      return {
        columns: normalColums,
        dataSource: data,
        pagination: {
          ...pagination,
          showTotal,
          size: "small",
          showSizeChanger: true,
        },
        scroll,
        loading,
        rowKey: "rowKey",
        ref: tableRef,
        onChange,
        ...(props ? props : {}),
      };
    },
    [normalColums, getLastState]
  );

  const getFormProps = useCallback(() => {
    const { fields } = fieldColumns;
    const { customFields, query, pagination, status } = getLastState();
    const onFinish = (values: any) => {
      const { pageSize } = pagination;
      const formQuery: Record<string, any> = {};
      for (const [key, value] of Object.entries(values)) {
        if (value === "") {
          formQuery[key] = undefined;
        } else {
          formQuery[key] = value;
        }
      }
      dispatch({
        type: actionType.loading,
        payload: {
          pagination: { current: 1, pageSize },
          ...query,
          query: formQuery,
        },
      });
    };
    const onReset = () => {
      const { current, pageSize } = pagination;
      // form.resetFields() 会重新挂载所有字段的组件，导致Select等组件重复发起请求;
      const defaultValues = {};
      fields.forEach((item) => {
        (defaultValues as any)[item.name as string] = undefined;
      });
      form.setFieldsValue(defaultValues);
      dispatch({
        type: actionType.loading,
        payload: {
          pagination: { current, pageSize },
          query: null,
        },
      });
    };
    return {
      fields,
      customFields,
      onFinish,
      form,
      onReset,
      loading: status === actionType.loading,
    };
  }, [fieldColumns, form, getLastState]);

  useEffect(() => {
    if (state.status === actionType.loading) {
      const { current, pageSize } = state.pagination;
      fetchTableData({
        pagination: { current, pageSize },
        query: state.query,
      } as ParamsType<P, T>);
    }
  }, [state, fetchTableData]);

  useEffect(() => {
    dispatch({
      type: actionType.loading,
    });
  }, []);
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return {
    getNormalTableProps,
    getFormProps,
    state,
    dispatch,
    tableRef,
    form,
  };
};
