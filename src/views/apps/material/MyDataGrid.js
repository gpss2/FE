import React from 'react';

const MyDataGrid = ({
  rows = [],
  columns = [],
  onRowClick,
  columnHeaderHeight = 40,
  rowHeight = 25,
  sx = {}, // MUI-like styling prop
}) => {
  const [selectedRowIndex, setSelectedRowIndex] = React.useState(null);

  // Helper to get nested sx styles safely
  const getSxStyle = (key) => sx[key] || {};

  return (
    <div style={{ height: '100%', overflow: 'auto', border: '1px solid black' }}>
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
                style={{
                  ...getSxStyle('& .MuiDataGrid-columnHeader'),
                  // ✅ IMPORTANT: Use the width from the column definition if it exists
                  width: col.width ? `${col.width}px` : 'auto', 
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  padding: '0 8px',
                  textAlign: col.headerAlign || 'center',
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
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        {/**********************
         * Table Body
         **********************/}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              style={{
                height: `${rowHeight}px`,
                backgroundColor: selectedRowIndex === rowIndex ? '#e0e0e0' : 'inherit',
                cursor: 'pointer',
              }}
              onClick={() => {
                setSelectedRowIndex(rowIndex);
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
                    api: { getSortedRowIds: () => rows.map(r => r.id) } 
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
};

export default MyDataGrid;