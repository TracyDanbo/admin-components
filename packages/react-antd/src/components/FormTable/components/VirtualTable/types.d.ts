import { PluginHook, TableInstance, TableOptions } from "react-table";

declare module "react-table" {
  export interface TableState<D> extends Record<string, any> {
    hiddenColumns?: Array<IdType<D>> | undefined;
    // custom state
    sort: Record<string, "Ascending" | "Descending">;
  }
  export type PaginationConfig = {
    current: number;
    defaultCurrent: number;
    defaultPageSize: number;
    pageSize: number;
    pageSizeOptions: number[];
    total: number;
  };

  export interface UseTableInstanceProps<D extends object> {
    state: TableState<D>;
    plugins: Array<PluginHook<D>>;
    dispatch: TableDispatch;
    columns: Array<ColumnInstance<D>>;
    allColumns: Array<ColumnInstance<D>>;
    visibleColumns: Array<ColumnInstance<D>>;
    headerGroups: Array<HeaderGroup<D>>;
    footerGroups: Array<HeaderGroup<D>>;
    headers: Array<ColumnInstance<D>>;
    flatHeaders: Array<ColumnInstance<D>>;
    rows: Array<Row<D>>;
    rowsById: Record<string, Row<D>>;
    getTableProps: (propGetter?: TablePropGetter<D>) => TableProps;
    getTableBodyProps: (propGetter?: TableBodyPropGetter<D>) => TableBodyProps;
    prepareRow: (row: Row<D>) => void;
    flatRows: Array<Row<D>>;
    totalColumnsWidth: number;
    allColumnsHidden: boolean;
    toggleHideColumn: (columnId: IdType<D>, value?: boolean) => void;
    setHiddenColumns: (
      param: Array<IdType<D>> | UpdateHiddenColumns<D>
    ) => void;
    toggleHideAllColumns: (value?: boolean) => void;
    getToggleHideAllColumnsProps: (
      props?: Partial<TableToggleHideAllColumnProps>
    ) => TableToggleHideAllColumnProps;
    getHooks: () => Hooks<D>;

    // custom property
    checkedRows: ({ name: string }) => number;
    getHeaderCheckboxProps: ({ name: string }) => {
      indeterminate: boolean;
      checked: boolean;
      disabled: boolean;
      title: string;
      onChange: (e: any) => void;
    };
    remotePagination: PaginationConfig;
  }
  export type StateReducer<D> = (
    newState: TableState<D>,
    action: ActionType,
    previousState: TableState<D>,
    instance?: TableInstance<D>
  ) => TableState<D>;

  export type UseTableOptions<D> = {
    columns: ReadonlyArray<Column<D>>;
    data: readonly D[];
  } & Partial<{
    initialState: Partial<TableState<D>>;
    stateReducer: (
      newState: TableState<D>,
      action: ActionType,
      previousState: TableState<D>,
      instance?: TableInstance<D>
    ) => TableState<D>;
    useControlledState: (state: TableState<D>, meta: Meta<D>) => TableState<D>;
    defaultColumn: Partial<Column<D>>;
    getSubRows: (originalRow: D, relativeIndex: number) => D[];
    getRowId: (
      originalRow: D,
      relativeIndex: number,
      parent?: Row<D>
    ) => string;
    autoResetHiddenColumns: boolean;
  }>;

  export interface TableOptions<D>
    extends UseTableOptions<D>,
      Record<string, any> {}

  export function useTable<D>(
    options: TableOptions<D>,
    ...plugins: Array<PluginHook<D>>
  ): TableInstance<D>;

  export interface UseTableColumnOptions<D extends object> {
    id?: IdType<D> | undefined;
    Header?: Renderer<HeaderProps<D>> | undefined;
    Footer?: Renderer<FooterProps<D>> | undefined;
    width?: number | string | undefined;
    minWidth?: number | undefined;
    maxWidth?: number | undefined;
    sticky?: "Left" | "Right";
    sortAble?: boolean;
    columns?: Column<D>[];
    checkAble?: boolean;
  }

  export interface UseTableRowProps<D extends object> {
    cells: Array<Cell<D>>;
    allCells: Array<Cell<D>>;
    values: Record<IdType<D>, CellValue>;
    getRowProps: (propGetter?: RowPropGetter<D>) => TableRowProps;
    index: number;
    original: D;
    id: string;
    subRows: Array<Row<D>>;
    getCellCheckboxProps: ({ name: string }) => {
      indeterminate: boolean;
      checked: boolean | undefined;
      disabled: boolean;
      title: string;
      onChange: (e: any) => void;
    };
  }
}
