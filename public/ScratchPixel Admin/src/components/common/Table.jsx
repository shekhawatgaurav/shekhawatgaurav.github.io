function Table({
  columns = [],
  data = [],
  renderActions,
  loading = false,
  loadingText = "Loading records...",
  emptyText = "No records found.",
  showIndex = false,
  indexLabel = "#",
  actionsLabel = "Actions",
  onRowClick,
  page = 1,
  pageSize = 10,
  paginated = false,
}) {
  const safePage = Math.max(1, Number(page || 1));
  const safePageSize = Math.max(1, Number(pageSize || 10));

  const totalColumns =
    columns.length + (renderActions ? 1 : 0) + (showIndex ? 1 : 0);

  const visibleData = paginated
    ? data.slice((safePage - 1) * safePageSize, safePage * safePageSize)
    : data;

  function getRowKey(row, rowIndex) {
    return row?.id || row?.uid || row?.docId || row?.key || rowIndex;
  }

  function handleRowKeyDown(event, row) {
    if (!onRowClick) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  }

  return (
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            {showIndex && <th>{indexLabel}</th>}

            {columns.map((column) => (
              <th
                key={column.key}
                className={column.headerClassName || ""}
                style={{
                  textAlign: column.align || "left",
                  width: column.width,
                }}
              >
                {column.label}
              </th>
            ))}

            {renderActions && (
              <th className="actions-column">{actionsLabel}</th>
            )}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={totalColumns} className="table-empty">
                {loadingText}
              </td>
            </tr>
          ) : visibleData.length === 0 ? (
            <tr>
              <td colSpan={totalColumns} className="table-empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            visibleData.map((row, rowIndex) => {
              const serialNumber = paginated
                ? (safePage - 1) * safePageSize + rowIndex + 1
                : rowIndex + 1;

              return (
                <tr
                  key={getRowKey(row, rowIndex)}
                  className={onRowClick ? "clickable-row" : ""}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(event) => handleRowKeyDown(event, row)}
                  onClick={() => {
                    if (onRowClick) onRowClick(row);
                  }}
                >
                  {showIndex && <td>{serialNumber}</td>}

                  {columns.map((column) => (
                    <td
                      key={column.key}
                      data-label={column.label}
                      className={column.className || ""}
                      style={{
                        textAlign: column.align || "left",
                      }}
                    >
                      {column.render ? column.render(row) : row[column.key] ?? "-"}
                    </td>
                  ))}

                  {renderActions && (
                    <td
                      data-label={actionsLabel}
                      className="table-actions-cell"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;