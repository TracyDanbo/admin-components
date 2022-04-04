import { Switch } from "antd";
import React, { useCallback } from "react";
import { actions, makePropGetter, useGetLatest } from "react-table";

enum SORT_VALUE {
  ASC = "Ascending",
  DESC = "Descending",
  UNKNOWN = "Unknown",
}

export const useRemoteSortBy = (hooks: any) => {
  hooks.getRemoteSortByProps = [
    (props: any, { instance, column }: { instance: any; column: any }) => {
      const {
        onChange,
        dispatch,
        state: { sorted },
        remotePagination,
      } = instance;
      const { disableSortBy, id, sortDescFirst } = column;
      return [
        props,
        {
          onClick: disableSortBy
            ? undefined
            : () => {
                let ifSorted;
                if (sortDescFirst)
                  switch (sorted[id as string]) {
                    case SORT_VALUE.ASC:
                      ifSorted = SORT_VALUE.UNKNOWN;
                      break;
                    case SORT_VALUE.DESC:
                      ifSorted = SORT_VALUE.ASC;
                      break;
                    default:
                      ifSorted = SORT_VALUE.DESC;
                      break;
                  }
                else {
                  switch (sorted[id as string]) {
                    case SORT_VALUE.ASC:
                      ifSorted = SORT_VALUE.DESC;
                      break;
                    case SORT_VALUE.DESC:
                      ifSorted = SORT_VALUE.UNKNOWN;
                      break;
                    default:
                      ifSorted = SORT_VALUE.ASC;
                      break;
                  }
                }
                const shouldExit = ifSorted !== SORT_VALUE.UNKNOWN;
                const newState = { ...sorted, [id]: ifSorted };
                if (!shouldExit) {
                  delete newState[id];
                }
                dispatch({
                  type: "changeSort",
                  payload: { key: id, ifSorted },
                });
              },
          style: {
            cursor: disableSortBy ? undefined : "pointer",
          },
          title: column.disableSortBy ? undefined : "Toggle SortBy",
        },
      ];
    },
  ];
  hooks.useInstance.push((instance: any) => {
    const {
      getHooks,
      state: { sorted },
      flatHeaders,
    } = instance;
    const getInstance = useGetLatest(instance);

    // add getCellCheckboxProps to  instance with params (instance and userProps)
    const getRemoteSortByProps = makePropGetter(
      getHooks().getRemoteSortByProps,
      { instance: getInstance() }
    );

    const getSortState = useCallback(() => {
      return sorted;
    }, [sorted]);

    flatHeaders.forEach((column: any) => {
      const { id } = column;
      column.getRemoteSortByProps = makePropGetter(
        getHooks().getRemoteSortByProps,
        {
          instance: getInstance(),
          column,
        }
      );
      column.isSorted = sorted[id] && sorted[id] !== SORT_VALUE.UNKNOWN;
      column.isSortedDesc = sorted[id] && sorted[id] == SORT_VALUE.DESC;
    });
    // add the props to the instance
    Object.assign(instance, {
      getRemoteSortByProps,
      getSortState,
    });
  });
  hooks.stateReducers.push((state: any, action: Record<string, any>) => {
    const { type, payload } = action;
    switch (type) {
      case actions.init:
        return {
          ...state,
          sorted: {},
        };
      case "changeSort": {
        const shouldExit = payload.sorted !== SORT_VALUE.UNKNOWN;
        const newState = { ...state.sorted, [payload.key]: payload.ifSorted };
        if (!shouldExit) {
          delete newState[payload.key];
        }

        return {
          ...state,
          sorted: newState,
        };
      }
      case "resetSort": {
        return {
          ...state,
          sorted: {},
        };
      }
      default:
        return state;
    }
  });
};
