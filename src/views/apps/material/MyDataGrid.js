import React from 'react';

// React.forwardRef를 사용하여 ref를 props로 받을 수 있도록 수정합니다.
const MyDataGrid = React.forwardRef((
  {
    rows = [],
    columns = [],
    onRowClick,
    columnHeaderHeight = 40,
    rowHeight = 25,
    sx = {}, // MUI-like styling prop
  },
  ref // 부모로부터 전달받은 ref
) => {
  const [selectedRowIndex, setSelectedRowIndex] = React.useState(null);
  const [sortConfig, setSortConfig] = React.useState(null);

  const getSxStyle = (key) => sx[key] || {};

  const sortedRows = React.useMemo(() => {
    let sortableRows = [...rows];
    if (sortConfig !== null) {
      sortableRows.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRows;
  }, [rows, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (columnField) => {
    if (!sortConfig || sortConfig.key !== columnField) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  return (
    // 전달받은 ref를 최상위 div에 연결합니다.
    <div ref={ref} style={{ height: '100%', overflow: 'auto', border: '1px solid black' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
        }}
      >
        {/**********************
         * Table Head
         **********************/}
        <thead>
          <tr style={{ height: `${columnHeaderHeight}px` }}>
            {columns.map((col, index) => (
              <th
                key={col.field || index}
                onClick={() => col.sortable !== false && handleSort(col.field)}
                style={{
                  ...getSxStyle('& .MuiDataGrid-columnHeader'),
                  width: col.width ? `${col.width}px` : 'auto',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  padding: '0 8px',
                  textAlign: col.headerAlign || 'center',
                  cursor: col.sortable !== false ? 'pointer' : 'default',
                }}
              >
                <div
                  style={{
                    ...getSxStyle('& .MuiDataGrid-columnHeaderTitleContainer'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: col.headerAlign || 'center',
                    height: '100%',
                  }}
                >
                  {col.headerName}
                  {getSortIndicator(col.field)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        {/**********************
         * Table Body
         **********************/}
        <tbody>
          {sortedRows.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              style={{
                height: `${rowHeight}px`,
                backgroundColor: selectedRowIndex === rowIndex ? '#e0e0e0' : 'inherit',
                cursor: 'pointer',
              }}
              onClick={() => {
                const originalIndex = rows.findIndex(originalRow => originalRow.id === row.id);
                setSelectedRowIndex(originalIndex);
                if (onRowClick) {
                  onRowClick({ row });
                }
              }}
            >
              {columns.map((col) => {
                const isIndexCell = col.cellClassName === 'index-cell';
                
                let cellContent;
                if (col.renderCell) {
                  const params = { 
                    id: row.id, 
                    row, 
                    api: { getSortedRowIds: () => sortedRows.map(r => r.id) } 
                  };
                  cellContent = col.renderCell(params);
                } else if (col.valueFormatter) {
                  cellContent = col.valueFormatter(row[col.field]);
                } else {
                  cellContent = row[col.field];
                }

                return (
                  <td
                    key={col.field}
                    style={{
                      ...getSxStyle('& .MuiDataGrid-cell'),
                      backgroundColor: isIndexCell ? getSxStyle('& .index-cell').backgroundColor : 'inherit',
                      textAlign: col.align || 'left',
                      padding: '0 8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default MyDataGrid;
