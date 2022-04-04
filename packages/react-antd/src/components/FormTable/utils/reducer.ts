import { Reducer } from "react";
import {
  ActionType,
  StateReducer,
  TableInstance,
  TableState,
} from "react-table";
import { Action } from "../types";

export const combineReducer = <S>(...args: Reducer<S, Action>[]) => {
  return (state: S, action: Action) => {
    let localState = state;
    args.forEach((reducer) => {
      localState = reducer(localState, action);
    });
    return state;
  };
};

export const combineStateReducer = <D extends object>(
  ...args: StateReducer<D>[]
) => {
  return (
    newState: TableState<D>,
    action: ActionType,
    previousState: TableState<D>,
    instance: TableInstance<D> | undefined
  ) => {
    return args.reduce(
      (s, reducer) => reducer(s, action, previousState, instance) || s,
      newState
    );
  };
};
