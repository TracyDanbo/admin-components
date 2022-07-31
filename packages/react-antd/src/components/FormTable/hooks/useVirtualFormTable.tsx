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
import { VirtualTableProps } from "../components/VirtualTable/VirtualTable";
import { useLastState } from "./useLastState";

import { TableInstance } from "react-table";
import { CustomConfigContext } from "../components/ConfigProvider";
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
    case actionType.loading: {
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
    }

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
    default:
      return state;
  }
};

const getVirtualColumn = <T extends object>(
  columns: VirtualColumn<T>[],
  cellMaps: CellMap,
  dispatch: React.Dispatch<Action>
) => {
  return columns.map((column) => {
    const { Cell: CellProperty, form, ...others } = column;
    let _CellProperty;
    if (typeof CellProperty === "object") {
      const type =
        (CellProperty as DefaultCell)?.type ||
        (CellProperty as CustomCell)?.customType;
      const _render = cellMaps[type]?.render;

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
          CellProperty as Cell,
          dispatch
        );
        const CellComponent = _render || DefaultCellComponent;
        return <CellComponent {...cellProps} />;
      };
    } else {
      _CellProperty = CellProperty;
    }
    if (column.columns) {
      column.columns = getVirtualColumn(column.columns, cellMaps, dispatch);
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

export const useVirtualFormTable = <T extends object, P = T>({
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
    ...(pagination ? { pagination } : {}),
  });
  // const initialValue = Object.assign(defaultInitialState, {
  //   columns,
  //   customFields,
  //   customCells,
  // });
  const stateReducer = userReducer
    ? combineReducer(defaultStateReducer, userReducer)
    : defaultStateReducer;
  const [state, dispatch] = useReducer(stateReducer, initialValue);
  const request = useRef(userRequest);
  const virtualTableRef = useRef({ dom: null, instance: null });
  const formRef = useRef(null);

  const getLastState = useLastState(state);
  const controllerRef = useRef<AbortController | undefined>();
  const fetchTableData = useCallback(
    async (
      params: ParamsType<P, T> = { pagination: { current: 1, pageSize: 20 } }
    ) => {
      controllerRef.current = new AbortController();
      const res = await request.current(params, controllerRef.current);
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
  }, [getLastState]);

  const fieldColumns = useMemo(() => {
    const fields: Field[] = [];
    const virtualColums: VirtualColumn<T>[] = [];
    userColumns.forEach((column) => {
      const { form, ...others } = column;
      if (form) {
        fields.push(form);
      }
      virtualColums.push(others as VirtualColumn<T>);
    });
    return { fields, virtualColums };
  }, [userColumns]);

  const virtualColums = useMemo(() => {
    const { virtualColums } = fieldColumns;
    let columns: VirtualColumn<T>[] = getVirtualColumn(
      virtualColums,
      cellMaps,
      dispatch
    );
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
  }, [fieldColumns, cellMaps, indexColumn]);

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
  }, [virtualColums, getLastState]);

  const getFormProps = useCallback(() => {
    const { fields } = fieldColumns;
    const { customFields } = getLastState();
    return { fields, customFields, ref: formRef };
  }, [fieldColumns, getLastState]);

  useEffect(() => {
    if (state.status === actionType.loading) {
      fetchTableData(state.query as ParamsType<P, T>);
    }
  }, [state, fetchTableData]);

  useEffect(() => {
    dispatch({
      type: actionType.loading,
      payload: { pagination: { current: 1, pageSize: 20 } },
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
    getVirtualTableProps,
    getFormProps,
    state,
    dispatch,
    tableRef: virtualTableRef,
    formRef,
  };
};
