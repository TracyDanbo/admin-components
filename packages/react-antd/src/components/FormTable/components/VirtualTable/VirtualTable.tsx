import React, {
  useRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  CSSProperties,
} from "react";
import { useVirtual } from "react-virtual";
import "./styles.css";
import {
  useTable,
  useFlexLayout,
  useRowSelect,
  TableState,
  TableInstance,
  Column,
  useFilters,
  StateReducer,
  PluginHook,
  actions,
  PaginationConfig,
  useResizeColumns,
} from "react-table";
import { Spin } from "antd";
import TableHeader, { SortableColumnInstance } from "./TableHeader";
import TableBody from "./TableBody";
import {
  useSticky,
  useSelectColumn,
  useCheckableColumns,
  useRemoteSortBy,
} from "./hooks";
import { TablePagination } from "./TablePagination";
import { combineStateReducer } from "../../utils/reducer";
import { useLastState } from "../../hooks/useLastState";

export interface VirtualTableProps<D extends object> {
  columns: ReadonlyArray<Column<D>>;
  data: D[];
  pagination: PaginationConfig;
  initialState?: Partial<TableState<D>>;
  stateReducer?: StateReducer<D>;
  customOptions?: Record<string, any>;
  hooks?: Array<PluginHook<D>>;
  loading?: boolean;
  onChange?: (params: {
    sorter?: Record<string, string>;
    pagination: { current: number; pageSize: number };
  }) => void;
  onSelectChange?: (rowIds: Record<string, boolean>) => void;
  columnResize?: boolean;
  style?: CSSProperties;
  className?: string | string[];
}

const VirtualTable = <D extends object>(
  {
    columns,
    data,
    pagination,
    initialState,
    stateReducer: userReducer,
    customOptions,
    hooks: userHooks = [],
    loading = false,
    onChange,
    onSelectChange,
    columnResize,
    className,
    ...others
  }: VirtualTableProps<D>,
  ref: React.Ref<unknown> | undefined
) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const localColumns = useMemo(() => {
    const setDefaultCanSort = (columns: Array<Column<D>>): Array<Column<D>> => {
      return columns.map((col) => {
        if (col.columns) {
          return { ...col, columns: setDefaultCanSort(col.columns) };
        }
        if (col.sortAble != undefined) {
          return col;
        }
        return { ...col, disableSortBy: true };
      });
    };
    const cols = setDefaultCanSort(columns as any[]);
    return cols;
  }, [columns]);
  // const localCustomOptions = useMemo(() => {
  //   return { onChange, remotePagination: pagination, ...customOptions };
  // }, [onChange, pagination, customOptions]);

  const getPagination = useLastState(pagination);

  const defaultStateReducer: StateReducer<D> = useCallback(
    (newState, action, previeState, instance) => {
      switch (action.type) {
        case actions.toggleAllPageRowsSelected:
        case actions.toggleRowSelected:
        case actions.toggleAllRowsSelected:
          onSelectChange && onSelectChange(newState.selectedRowIds);
          return newState;
        case "changeSort":
          const { sorted } = newState;
          const { current, pageSize } = getPagination();
          onChange &&
            onChange({
              sorter: sorted,
              pagination: { current, pageSize } as {
                current: number;
                pageSize: number;
              },
            });
          return newState;
        default:
          return newState;
      }
    },
    []
  );

  const defaultHooks = useMemo(() => {
    let hooks = [useFlexLayout, useCheckableColumns, useFilters];
    if (onSelectChange) {
      hooks = hooks.concat([useRowSelect, useSelectColumn]);
    }
    if (columnResize) {
      hooks = hooks.concat([useResizeColumns]);
    }
    hooks = hooks.concat([useRemoteSortBy, useSticky]);
    return hooks;
    // if (onSelectChange) {
    //   return [
    //     useFlexLayout,
    //     useRowSelect,
    //     useSelectColumn,
    //     useCheckableColumns,
    //     useRemoteSortBy,
    //   ];
    // }
    // return [useFlexLayout, useCheckableColumns, useRemoteSortBy];
  }, [onSelectChange, userHooks, columnResize]);

  const stateReducer = userReducer
    ? combineStateReducer(defaultStateReducer, userReducer)
    : defaultStateReducer;

  const tableInstance = useTable<D>(
    {
      columns: localColumns,
      data,
      initialState,
      stateReducer,
      ...customOptions,
    },
    ...defaultHooks
    // useResizeColumns,
    // useFilters,
    // ...userHooks,
    // useSticky
  );
  const {
    getTableProps,
    headerGroups,
    getTableBodyProps,
    rows,
    prepareRow,
    headers,
    allColumns,
    state,
    onPaginationChange,
  } = tableInstance;
  useImperativeHandle(ref, () => ({
    dom: bodyRef.current,
    instance: tableInstance,
  }));
  const rowVirtualizer = useVirtual({
    size: rows.length,
    parentRef: bodyRef,
    estimateSize: React.useCallback(() => 55, []),
  });

  const headerGroupsProps = headerGroups[0].getHeaderGroupProps();
  const width = useMemo(() => {
    return allColumns.reduce((acc, cur) => acc + cur.totalWidth, 0);
  }, [allColumns]);

  const onPageChange = useCallback(
    (page, pageSize) => {
      const { sorted } = state;
      onPaginationChange && onPaginationChange(page, pageSize);
      onChange &&
        onChange({ pagination: { current: page, pageSize }, sorter: sorted });
    },
    [onChange, state]
  );

  const defaultClassName = useMemo(() => {
    return ["table"].concat(className as string[]).join(" ");
  }, [className]);

  return (
    <div className={defaultClassName} {...others}>
      <Spin spinning={loading} wrapperClassName="spinner">
        <div ref={tableRef} {...getTableProps()} style={{ width }}>
          <TableHeader
            headers={headers as SortableColumnInstance<object>[]}
            headerGroupsProps={headerGroupsProps}
          />
          <TableBody
            rows={rows}
            prepareRow={prepareRow}
            rowVirtualizer={rowVirtualizer}
            getTableBodyProps={getTableBodyProps}
            ref={bodyRef}
          />
        </div>
      </Spin>
      <TablePagination {...pagination} onChange={onPageChange} />
    </div>
  );
};

const VirtualTableWrapper = React.forwardRef(VirtualTable) as <
  D extends object
>(
  props: VirtualTableProps<D> & {
    ref?: React.ForwardedRef<{
      dom: HTMLDivElement | null;
      instance: TableInstance | null;
    }>;
  }
) => ReturnType<typeof VirtualTable>;

export default VirtualTableWrapper;
