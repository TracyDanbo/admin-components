import { useReducer, useRef, useCallback, useMemo, useEffect } from "react";
import { defaultCellMap } from "../components/default";
import {
  Field,
  NormalColumn,
  FormTableOption,
  VirtualColumn,
  ParamsType,
  CellMap,
  DefaultCell,
  CustomCell,
  Cell,
  Action,
} from "../types";
import { getCellprops } from "../utils/cellConstrutor";
import { DefaultCell as DefaultCellComponent } from "../components/CellComponents";
import { ColumnType, TablePaginationConfig } from "antd/lib/table";
import { VirtualTableProps } from "../components/VirtualTable/VirtualTable";
import { useLastState } from "@/hooks";
import {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from "antd/lib/table/interface";
import { TableInstance } from "react-table";
//  state

//  state = {data: [], pagination,loading}
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
  query: {},
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
    case actionType.loading:
      const { pagination } = action.payload;
      return {
        ...state,
        status: actionType.loading,
        pagination: {
          ...state.pagination,
          ...pagination,
        },
        query: action.payload,
      };
    case actionType.success: {
      const {
        data,
        success,
        page: current,
        count: pageSize,
        ...pagination
      } = action.payload;
      return {
        ...state,
        data,
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
  cellMaps: CellMap
): ColumnType<T>[] => {
  return columns.map((column) => {
    const {
      title,
      dataIndex,
      render: customRender,
      cell,
      form,
      ...others
    } = column;
    const type =
      (cell as DefaultCell)?.type || (cell as CustomCell)?.customType;
    let _render = cellMaps[type]?.render;
    let render = undefined;
    if (customRender) {
      render = customRender;
    } else {
      render = (text: string, record: Record<string, any>, index: number) => {
        // const { props, action } = cell;
        const props = getCellprops(
          text,
          record,
          index,
          cell as Cell,
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
      children = getNormalColumn(column.children, cellMaps);
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
const getVirtualColumn = <T extends object>(
  columns: VirtualColumn<T>[],
  cellMaps: CellMap
) => {
  return columns.map((column) => {
    const { Cell: CellProperty, form, ...others } = column;
    let _CellProperty;
    if (typeof CellProperty === "object") {
      const type =
        (CellProperty as DefaultCell)?.type ||
        (CellProperty as CustomCell)?.customType;
      let _render = cellMaps[type]?.render;

      _CellProperty = (props: any) => {
        const {
          value,
          row: { values },
          index,
        } = props;

        const cellProps = getCellprops(
          value,
          values,
          index,
          CellProperty as Cell
        );
        const CellComponent = _render || DefaultCellComponent;
        return <CellComponent {...cellProps} />;
      };
    } else {
      _CellProperty = CellProperty;
    }
    if (column.columns) {
      column.columns = getVirtualColumn(column.columns, cellMaps);
    }
    return {
      ...(_CellProperty ? { Cell: _CellProperty } : {}),
      ...others,
    };
  });
};

const combineReducer = (...args: typeof defaultStateReducer[]) => {
  return (state: typeof defaultInitialState, action: Action) => {
    let localState = state;
    args.forEach((reducer) => {
      localState = reducer(localState, action);
    });
    return state;
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

const virtualIndexColumn = [
  {
    Header: "序号",
    accessor: "_index",
    width: 100,
  },
];

const showTotal = (total: number, range: number[]) => {
  const [begin, end] = range;
  return `第 ${begin}-${end}条/总共 ${total} 条`;
};

export const useFormTable = <T extends object>({
  request: userRequest,
  stateReducer: userReducer,
  columns: userColumns,
  type,
  customCells,
  customFields,
  columns,
  indexColumn = true,
}: FormTableOption<T>) => {
  const initialValue = Object.assign(defaultInitialState, {
    columns,
    customFields,
    customCells,
  });
  const stateReducer = userReducer
    ? combineReducer(defaultStateReducer, userReducer)
    : defaultStateReducer;
  const [state, dispatch] = useReducer(stateReducer, initialValue);
  const request = useRef(userRequest);
  const virtualTableRef = useRef({ dom: null, instance: null });
  const tableRef = useRef(null);
  const formRef = useRef(null);

  const getLastState = useLastState(state);

  const fetchTableData = useCallback(
    async (
      params: ParamsType<T> = { pagination: { current: 1, pageSize: 20 } }
    ) => {
      const res = await request.current(params);
      if (res.success) {
        dispatch({ type: actionType.success, payload: res });
      } else {
        dispatch({ type: actionType.failed, payload: res });
      }
    },
    []
  );

  const cellMaps = useMemo(() => {
    const { customCells } = getLastState();
    return Object.assign({}, defaultCellMap, customCells);
  }, []);

  const fieldColumns = useMemo(() => {
    const fields: Field[] = [];
    const normalColums: NormalColumn<T>[] = [];
    const virtualColums: VirtualColumn<T>[] = [];
    userColumns.forEach((column) => {
      const { form, ...others } = column;
      if (form) {
        fields.push(form);
      }
      if (type === "normal") {
        normalColums.push(others as NormalColumn<T>);
      } else {
        virtualColums.push(others as VirtualColumn<T>);
      }
    });
    return { fields, normalColums, virtualColums };
  }, []);

  const virtualColums = useMemo(() => {
    const { virtualColums } = fieldColumns;
    let columns = getVirtualColumn(virtualColums, cellMaps);
    if (indexColumn) {
      const sticky = columns.some((col) => col.sticky?.toLowerCase() === "left")
        ? "left"
        : undefined;
      columns = (
        virtualIndexColumn.map((item) => ({
          ...item,
          sticky,
        })) as VirtualColumn<T>[]
      ).concat(columns);
    }
    return columns;
  }, [fieldColumns, cellMaps]);

  const normalColums = useMemo(() => {
    const { normalColums } = fieldColumns;
    const columns = indexColumn
      ? (normalIndexColumn as ColumnType<T>[]).concat(
          getNormalColumn(normalColums, cellMaps)
        )
      : getNormalColumn(normalColums, cellMaps);
    return columns;
  }, [fieldColumns, cellMaps]);

  const getVirtualTableProps = useCallback((): VirtualTableProps<T> & {
    ref?: React.ForwardedRef<{
      dom: HTMLDivElement | null;
      instance: TableInstance | null;
    }>;
  } => {
    const { pagination, data: dataSource, status } = getLastState();
    const data = dataSource.map((item: T, index: number) => ({
      ...item,
      _index: index + 1,
    }));
    const loading = status === actionType.loading;

    const onChange = ({
      pagination,
      sorter,
    }: {
      pagination: { current: number; pageSize: number };
      sorter?: Record<string, any>;
    }) => {
      const { current, pageSize } = pagination;
      dispatch({
        type: actionType.loading,
        payload: { pagination: { current, pageSize }, sorter },
      });
    };

    return {
      columns: virtualColums,
      onChange,
      pagination: {
        ...pagination,
        showTotal,
        size: "small",
        showSizeChanger: true,
      },
      data,
      loading,
      ref: virtualTableRef,
    };
  }, [virtualColums]);
  const getNormalTableProps = useCallback(() => {
    const { pagination, data, status } = getLastState();
    const dataSource = data.map((item: T, index: number) => ({
      ...item,
      _index: index + 1,
      rowKey:
        (item as any).id || `${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    }));
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
        payload: { pagination: { current, pageSize }, sorter, filters },
      });
    };

    return {
      columns: normalColums,
      dataSource,
      pagination: { ...pagination, showTotal, size: "small" },
      loading,
      rowKey: "rowKey",
      ref: tableRef,
      onChange,
    };
  }, [normalColums]);

  const getFormProps = useCallback(() => {
    const { fields } = fieldColumns;
    const { customFields } = getLastState();
    return { fields, customFields, ref: formRef };
  }, [fieldColumns]);

  useEffect(() => {
    if (state.status === actionType.loading) {
      fetchTableData(state.query as ParamsType<T>);
    }
  }, [state]);

  useEffect(() => {
    dispatch({
      type: actionType.loading,
      payload: { pagination: { current: 1, pageSize: 20 } },
    });
  }, []);

  return {
    getVirtualTableProps,
    getNormalTableProps,
    getFormProps,
    state,
    dispatch,
    tableRef: type === "virtual" ? virtualTableRef : tableRef,
    formRef,
  };
};
