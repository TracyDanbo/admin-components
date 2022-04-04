import { useCallback, useMemo, useRef } from "react";
import {
  actions,
  ActionType,
  makePropGetter,
  Row,
  TableInstance,
  TableState,
  useGetLatest,
  useMountedLayoutEffect,
} from "react-table";

interface TableInstanceWithCheckState<D extends object = {}>
  extends TableInstance<D> {
  getCheckBoxState: (name: string) => {
    checked: boolean;
    indeterminate: boolean;
  };
}

type StateReducer<D extends object> =
  | ((
      newState: TableState<D>,
      action: ActionType,
      previousState: TableState<D>,
      instance?: TableInstanceWithCheckState<D> | undefined
    ) => TableState<D>)
  | undefined;

export const useCheckableColumns = (hooks: any) => {
  hooks.getCellCheckboxProps = [defaultGetCellCheckboxProps];
  hooks.getHeaderCheckboxProps = [defaultGetHeaderCheckboxProps];

  hooks.useInstance.push(useInstance);
  hooks.prepareRow.push(prepareRow);

  hooks.stateReducers.push(defaultStateReducer);
};

const defaultGetCellCheckboxProps = (
  props: any,
  {
    instance,
    row,
    userProps,
  }: {
    instance: TableInstanceWithCheckState;
    row: Row;
    userProps: { name: string; defaultChecked: boolean };
  }
) => {
  const { dispatch, state } = instance;
  const { name } = userProps;
  const key = `${name}CheckedIds`;
  const checked = (state as any)[key] ? (state as any)[key][row.id] : false;

  return [
    props,
    {
      indeterminate: false,
      checked: checked,
      disabled: false,
      title: name,
      onChange: (e: any) => {
        dispatch({
          type: "checkCell",
          payload: { rowId: row.id, checked: e.target.checked, key },
        });
      },
    },
  ];
};

const defaultGetHeaderCheckboxProps = (
  props: any,
  {
    instance,
    userProps,
  }: {
    instance: TableInstanceWithCheckState<object>;
    userProps: any;
  }
) => {
  const { dispatch, state, getCheckBoxState } = instance;
  const { name } = userProps;
  const key = `${name}CheckedIds`;
  const { checked, indeterminate } = getCheckBoxState(name);
  return [
    props,
    {
      indeterminate: indeterminate,
      checked: checked,
      disabled: false,
      title: name,
      onChange: (e: any) => {
        dispatch({
          type: "checkeAll",
          payload: { key, checked: e.target.checked },
        });
      },
    },
  ];
};

const defaultStateReducer: StateReducer<object> = (
  state,
  action,
  previousState,
  instance
) => {
  const { type, payload } = action;
  switch (type) {
    case actions.init:
      return {
        ...state,
      };
    case "checkeAll": {
      const newState: Record<string, any> = {};
      if (payload.checked) {
        (instance as TableInstanceWithCheckState).rows.forEach((row) => {
          newState[row.id] = payload.checked;
        });
      }
      return {
        ...state,
        [payload.key]: newState,
      };
    }
    case "checkCell": {
      const oldState = (state as any)[payload.key] || {};
      const shouldExist = action.payload.checked;
      const newState = JSON.parse(JSON.stringify(oldState));
      newState[action.payload.rowId] = action.payload.checked;

      if (!shouldExist) {
        delete newState[action.payload.rowId];
      }
      return {
        ...state,
        [payload.key]: {
          ...newState,
        },
      };
    }
    case "iniCheckState": {
      return {
        ...state,
        ...payload,
      };
    }
    default:
      return state;
  }
};

const useInstance = (instance: TableInstanceWithCheckState) => {
  const needInitial = useRef(true);

  const { getHooks, state, rows, data, allColumns, dispatch } = instance;
  const getInstance = useGetLatest(instance);

  // add getCellCheckboxProps to  instance with params (instance and userProps)
  const getHeaderCheckboxProps = makePropGetter(
    getHooks().getHeaderCheckboxProps,
    { instance: getInstance() }
  );
  const checkedRows = useCallback(
    ({ name }) => {
      const list = (state as any)[`${name}CheckedIds`];
      return list ? Object.keys(list)?.length : 0;
    },
    [state]
  );

  const getCheckBoxState = useCallback(
    (name) => {
      const checkBoxState = {
        checked: false,
        indeterminate: false,
      };
      const list = (state as any)[`${name}CheckedIds`];
      if (list && Object.keys(list).length === rows.length) {
        checkBoxState.checked = true;
      }
      if (
        list &&
        Object.keys(list).length &&
        Object.keys(list).length !== rows.length
      ) {
        checkBoxState.indeterminate = true;
      }
      return checkBoxState;
    },
    [state]
  );

  const initialState = useMemo(() => {
    const inistal: any = {};
    allColumns.forEach((col) => {
      if (col?.checkAble) {
        const name = col.id;
        const key = `${col.id}CheckedIds`;
        inistal[key] = {};
        data.forEach((item: any) => {
          if (item[name]) {
            inistal[key][item.id] = item[name];
          }
        });
      }
    });
    return inistal;
  }, [allColumns, data]);

  useMountedLayoutEffect(() => {
    if (needInitial.current) {
      dispatch({ type: "iniCheckState", payload: initialState });
    }
  }, [initialState]);

  // add the props to the instance
  Object.assign(instance, {
    getHeaderCheckboxProps,
    checkedRows,
    getCheckBoxState,
  });
};

const prepareRow = (row: any, { instance }: { instance: TableInstance }) => {
  // add getCellCheckboxProps to the row  with params (instance、row and userProps)
  row.getCellCheckboxProps = makePropGetter(
    instance.getHooks().getCellCheckboxProps,
    { instance, row }
  );
};
