import { Cell, CellType, CustomCell, DefaultCell } from "../types";

export const getCellprops = <T extends unknown>(
  text: string | number | boolean,
  record: T,
  index: number,
  cell: Cell,
  defaultCreateProps?: (
    text: string | number | boolean,
    record: any,
    index: number
  ) => object
) => {
  const type = (cell as DefaultCell)?.type || (cell as CustomCell)?.customType;
  switch (type) {
    case CellType.Switch: {
      return {
        defaultChecked: text,
        record,
        ...(cell.createProps ? cell.createProps(text, record, index) : {}),
      };
    }
    case CellType.NumberInput: {
      return {
        defaultValue: text,
        record,
        ...(cell.createProps ? cell.createProps(text, record, index) : {}),
      };
    }
    case CellType.Tag: {
      return {
        ...(cell.createProps
          ? cell.createProps(text, record, index)
          : { children: text }),
      };
    }
    case CellType.Image || CellType.Avatar:
      return {
        ...(cell.createProps
          ? cell.createProps(text, record, index)
          : { src: text }),
      };
    // case CellType.Avatar:
    //   return {
    //     ...(cell.createProps
    //       ? cell.createProps(text, record, index)
    //       : { src: text }),
    //   };
    case CellType.LongText:
      return {
        title: text,
      };
    default:
      const createProps = cell?.createProps || defaultCreateProps;
      return {
        value: text,
        ...(createProps ? createProps(text, record, index) : {}),
      };
  }
};
