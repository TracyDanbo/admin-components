import { Column } from "react-table";

const getStickyProps = (
  column: any,
  instance: any,
  type: "header" | "cell"
) => {
  const columns = type === "header" ? instance.columns : instance.allColumns;
  const totalWidth = instance.allColumns.reduce(
    (acc: number, cur: any) => acc + cur.totalWidth,
    0
  );
  const isSticky = instance.flatHeaders
    .filter((c: Column) => c.id === column.id)[0]
    ?.sticky?.toLowerCase();
  const index = isSticky
    ? columns.findIndex((c: Column) => c.Header === column.Header)
    : -1;

  let isLast = undefined;
  if (index > -1) {
    isLast =
      isSticky === "left"
        ? columns[index + 1]?.sticky == undefined
        : columns[index - 1]?.sticky == undefined;
  }

  return {
    style: {
      position: isSticky ? "sticky" : undefined,
      [isSticky]:
        isSticky === "left"
          ? `${column.totalLeft}px`
          : `${totalWidth - column.totalLeft - column.totalWidth}px`,
      zIndex: isSticky ? 1 : undefined,
    },
    ["data-sticky"]: isLast ? isSticky : undefined,
  };
};

export const useSticky = (hooks: any) => {
  hooks.getCellProps.push(defaultCellGetStickyProps);
  hooks.getHeaderProps.push(defaultHeaderGetStickyProps);
};

const defaultCellGetStickyProps = (props: any, { cell, instance }: any) => {
  return [props, getStickyProps(cell.column, instance, "cell")];
};

const defaultHeaderGetStickyProps = (props: any, { instance, column }: any) => {
  const _column = column.placeholderOf ? column.placeholderOf : column;

  return [props, getStickyProps(_column, instance, "header")];
};
