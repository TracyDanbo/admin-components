import {
  Action,
  Cell,
  CellType,
  CreatePropsParamsType,
  CustomCell,
  DefaultCell,
} from "../types";

export const getCellprops = <T>(
  text: string | number | boolean,
  record: T,
  index: number,
  cell: Cell,
  dispatch: React.Dispatch<Action>,
  defaultCreateProps?: (params: CreatePropsParamsType) => object
) => {
  const type = (cell as DefaultCell)?.type || (cell as CustomCell)?.customType;
  switch (type) {
    case CellType.Switch: {
      return {
        defaultChecked: text,
        record,
        ...(cell.createProps
          ? cell.createProps({ text, record, index, dispatch })
          : {}),
      };
    }
    case CellType.NumberInput: {
      return {
        defaultValue: text,
        record,
        ...(cell.createProps
          ? cell.createProps({ text, record, index, dispatch })
          : {}),
      };
    }
    case CellType.Tag: {
      return {
        ...(cell.createProps
          ? cell.createProps({ text, record, index, dispatch })
          : { children: text }),
      };
    }
    case CellType.Image || CellType.Avatar:
      return {
        ...(cell.createProps
          ? cell.createProps({ text, record, index, dispatch })
          : { src: text }),
      };
    // case CellType.Avatar:
    //   return {
    //     ...(cell.createProps
    //       ? cell.createProps({text, record, index,dispatch})
    //       : { src: text }),
    //   };
    case CellType.LongText:
      return {
        title: text,
        text,
        ...(cell.createProps
          ? cell.createProps({ text, record, index, dispatch })
          : { title: text }),
      };
    default: {
      const createProps = cell?.createProps || defaultCreateProps;
      return {
        value: text,
        ...(createProps ? createProps({ text, record, index, dispatch }) : {}),
      };
    }
  }
};
