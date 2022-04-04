import React, { useImperativeHandle, useRef } from "react";
import { Row, TableBodyPropGetter, TableBodyProps } from "react-table";
import { VirtualItem } from "react-virtual";

type ScrollAlignment = "start" | "center" | "end" | "auto";

interface ScrollToOptions {
  align: ScrollAlignment;
}

interface ScrollToOffsetOptions extends ScrollToOptions {}
interface ScrollToIndexOptions extends ScrollToOptions {}
interface RowVirtualizer {
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollToOffset: (
    index: number,
    options?: ScrollToOffsetOptions | undefined
  ) => void;
  scrollToIndex: (
    index: number,
    options?: ScrollToIndexOptions | undefined
  ) => void;
  measure: () => void;
}

interface VirtualTableBodyProps<D extends object> {
  rows: Row<D>[];
  prepareRow: (row: Row<D>) => void;
  rowVirtualizer: RowVirtualizer;
  getTableBodyProps: (
    propGetter?: TableBodyPropGetter<D> | undefined
  ) => TableBodyProps;
}

const VirtualTableBody = <D extends object>(
  {
    rows,
    prepareRow,
    rowVirtualizer,
    getTableBodyProps,
  }: VirtualTableBodyProps<D>,
  ref: React.Ref<unknown> | undefined
) => {
  const tableRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => tableRef.current as HTMLDivElement);
  return (
    <div
      {...getTableBodyProps()}
      className="table-body"
      ref={tableRef}
      style={{
        height: `${rowVirtualizer.totalSize}px`,
        width: "100%",
        position: "relative",
      }}
      onScroll={() => {
        console.log("scroll");
      }}
    >
      {rowVirtualizer.virtualItems.map((virtualRow, index) => {
        const row = rows[index];
        const { index: vIndex } = virtualRow;
        prepareRow(row);
        return (
          <div
            {...row.getRowProps()}
            key={vIndex}
            className="table-row"
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {row.cells.map((cell) => {
              return (
                <div {...cell.getCellProps()} className="table-cell">
                  {cell.render("Cell")}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const VirtualTableBodyWrapper = React.forwardRef(VirtualTableBody) as <
  D extends object
>(
  props: VirtualTableBodyProps<D> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReturnType<typeof VirtualTableBody>;

export default VirtualTableBodyWrapper;
