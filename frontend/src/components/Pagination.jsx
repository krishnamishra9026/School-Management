import React from "react";
import ReactPaginateModule from "react-paginate";

// react-paginate ships CommonJS; Vite's dev interop can hand back
// the module object ({ default: Component }) instead of the component.
const ReactPaginate = ReactPaginateModule.default || ReactPaginateModule;

/**
 * Shared table pagination built on react-paginate.
 *
 * page       - current page (1-based)
 * totalPages - total number of pages
 * total      - total number of records
 * limit      - records per page
 * label      - record name shown in the summary ("users", "classes"...)
 * onChange   - called with the new 1-based page
 */
const Pagination = ({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 10,
  label = "records",
  onChange,
}) => {
  if (!total) {
    return null;
  }

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mt-3">
      <p className="text-muted mb-0 text-nowrap">
        Showing <strong>{from}</strong> to <strong>{to}</strong> of{" "}
        <strong>{total}</strong> {label}
      </p>

      {totalPages > 1 && (
        <ReactPaginate
          forcePage={page - 1}
          pageCount={totalPages}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => onChange?.(selected + 1)}
          previousLabel={<i className="mdi mdi-chevron-left" />}
          nextLabel={<i className="mdi mdi-chevron-right" />}
          breakLabel="..."
          containerClassName="pagination pagination-rounded pagination-sm mb-0"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakClassName="page-item disabled"
          breakLinkClassName="page-link"
          activeClassName="active"
          disabledClassName="disabled"
          renderOnZeroPageCount={null}
        />
      )}
    </div>
  );
};

export default Pagination;
