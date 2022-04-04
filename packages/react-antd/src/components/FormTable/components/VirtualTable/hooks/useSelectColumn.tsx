import { Checkbox } from "antd";

export const useSelectColumn = (hooks: any) => {
  hooks.visibleColumns.push(defaultSelectColumns);
};

const defaultSelectColumns = (columns: any) => {
  return [
    // Let's make a column for selection
    {
      id: "selection",
      sticky: "left",
      width: 60,
      disableSortBy: true,
      // The header can use the table's getToggleAllRowsSelectedProps method
      // to render a checkbox
      Header: ({ getToggleAllRowsSelectedProps }: any) => {
        return (
          <div>
            <Checkbox {...getToggleAllRowsSelectedProps()} />
          </div>
        );
      },
      // The cell can use the individual row's getToggleRowSelectedProps method
      // to the render a checkbox
      Cell: ({ row }: any) => (
        <div>
          <Checkbox {...row.getToggleRowSelectedProps()} />
        </div>
      ),
    },
    ...columns,
  ];
};
