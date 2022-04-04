import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Table as AntdTable } from "antd";
import { TableProps as AntdTableProps } from "antd/lib/table";
import "./styles.css";
import { useSyncScroll, SyncDirection } from "../../hooks/useSyncScroll";

const Table = <T extends object>(
  props: Omit<AntdTableProps<T>, "columns" | "dataSource">,
  ref: React.Ref<HTMLDivElement | null>
) => {
  const [width, setWidth] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const tableContentRef = useRef<Element | null>(null);
  useSyncScroll([divRef, tableContentRef], SyncDirection.Horizontal);
  useImperativeHandle(ref, () => tableRef.current);
  useEffect(() => {
    if (divRef.current && tableRef.current) {
      const table = tableRef.current.querySelector("table");
      tableContentRef.current =
        tableRef.current.querySelector(".ant-table-content");
      setWidth(table?.offsetWidth || 0);
    }
  }, []);
  console.log(props);
  return (
    <>
      <div className="container" ref={divRef}>
        <div
          style={{
            height: 1,
            width: width,
          }}
        />
      </div>
      <AntdTable<T> ref={tableRef} {...props} />
    </>
  );
};

const TableWrapper = React.forwardRef(Table) as <T extends object>(
  props: Omit<AntdTableProps<T>, "columns" | "dataSource"> & {
    ref?: React.Ref<HTMLDivElement | null>;
  }
) => ReturnType<typeof Table>;

// const VirtualTableWrapper = React.forwardRef(VirtualTable) as <
//   D extends object
// >(
//   props: VirtualTableProps<D> & {
//     ref?: React.ForwardedRef<{
//       dom: HTMLDivElement | null;
//       instance: TableInstance | null;
//     }>;
//   }
// ) => ReturnType<typeof VirtualTable>;

export default TableWrapper;
