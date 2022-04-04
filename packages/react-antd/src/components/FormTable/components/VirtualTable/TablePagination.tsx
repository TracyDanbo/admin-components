import { Pagination, PaginationProps } from "antd";

export const TablePagination = (props: PaginationProps) => {
  return (
    <div className="table-pagination">
      <Pagination {...props} />
    </div>
  );
};
