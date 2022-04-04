import { CSSProperties, useCallback } from "react";
import {
  HeaderGroupPropGetter,
  UseFiltersColumnOptions,
  UseResizeColumnsColumnProps,
  UseTableColumnProps,
} from "react-table";
import {
  CaretUpOutlined,
  CaretDownOutlined,
  FilterOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu } from "antd";

const SortArrow = ({ col }: { col: SortableColumnInstance<object> }) => {
  const { isSorted, isSortedDesc, disableSortBy } = col;
  const desc = isSorted && isSortedDesc;
  const asc = isSorted && !isSortedDesc;
  if (disableSortBy) {
    return null;
  }
  return (
    <div className="sort">
      <CaretUpOutlined
        style={{
          fontSize: 11,
          color: asc ? "#1890ff" : "#bfbfbf",
        }}
      />
      <CaretDownOutlined
        style={{
          fontSize: 11,
          marginTop: "-0.3em",
          color: desc ? "#1890ff" : "#bfbfbf",
        }}
      />
    </div>
  );
};

const Filter = ({ col }: { col: SortableColumnInstance<object> }) => {
  const enable = col.canFilter && col.Filter;
  if (enable) {
    return (
      <Dropdown
        overlay={col.render("Filter") as JSX.Element}
        trigger={["click"]}
        placement="bottom"
      >
        <FilterOutlined />
      </Dropdown>
    );
  }
  return null;
};

const Resizer = ({ col }: { col: SortableColumnInstance<object> }) => {
  if (col.getResizerProps) {
    return (
      <div
        {...col.getResizerProps()}
        className={`resizer ${col.isResizing ? "isResizing" : ""}`}
      >
        <HolderOutlined style={{ color: "#959393" }} />
      </div>
    );
  }

  return null;
};

export interface SortableColumnInstance<D extends object>
  extends UseTableColumnProps<D>,
    UseFiltersColumnOptions<D>,
    UseResizeColumnsColumnProps<D> {
  getSortByToggleProps?: (userProps?: object) => {
    onClick: () => void | undefined;
    style: CSSProperties | undefined;
    title: string | undefined;
  };
  getRemoteSortByProps?: () => {
    onClick: () => void | undefined;
    style: CSSProperties | undefined;
    title: string | undefined;
  };
  headers?: SortableColumnInstance<D>[];
  isSorted?: boolean;
  isSortedDesc?: boolean;
  disableSortBy?: boolean;
  canFilter?: boolean;
}

const TableHeader = ({
  headers,
  headerGroupsProps,
}: {
  headers: Array<SortableColumnInstance<object>>;
  headerGroupsProps: HeaderGroupPropGetter<object>;
}) => {
  const headerColumn = useCallback(
    (
      column: SortableColumnInstance<object>,
      headerGroupsProps: HeaderGroupPropGetter<object>
    ) => {
      if (Array.isArray(column?.headers) && column?.headers.length > 1) {
        return (
          <div {...column.getHeaderProps()} className="table-cell">
            <div className="table-subCell">{column.render("Header")}</div>
            <div {...headerGroupsProps} className="table-subHeader">
              {column.headers.map((header) =>
                headerColumn(header, headerGroupsProps)
              )}
            </div>
          </div>
        );
      }

      let col = column?.headers ? column?.headers[0] : column;

      let headerProps = {};
      if (col?.getRemoteSortByProps) {
        headerProps = col?.getRemoteSortByProps();
        // headerProps = col.getHeaderProps(col?.getSortByToggleProps());
      }
      return (
        <div
          {...col.getHeaderProps()}
          className={col.depth ? "table-subCell" : "table-cell"}
        >
          <div className="table-cell-content">
            <div className="table-cell-content" {...headerProps}>
              <div>{col.render("Header")}</div>
              <SortArrow col={col} />
            </div>
            <Filter col={col} />
          </div>
          <Resizer col={col} />
        </div>
      );
    },
    []
  );
  return (
    <div {...headerGroupsProps} className="table-header">
      {headers.map((column) => {
        return headerColumn(column, headerGroupsProps);
      })}
    </div>
  );
};

export default TableHeader;
