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
  // 1. 정렬 상태 추가 (어떤 컬럼을, 어떤 방향으로 정렬할지)
  // { key: 'calories', direction: 'ascending' } 와 같은 형태
  const [sortConfig, setSortConfig] = React.useState(null);

  // Helper to get nested sx styles safely
  const getSxStyle = (key) => sx[key] || {};

  // 2. 정렬 로직 추가 (useMemo로 성능 최적화)
  // rows나 sortConfig가 변경될 때만 정렬을 다시 수행
  const sortedRows = React.useMemo(() => {
    let sortableRows = [...rows]; // 원본 배열 수정을 피하기 위해 복사
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

  // 3. 헤더 클릭 시 정렬 상태를 변경하는 함수
  const handleSort = (key) => {
    let direction = 'ascending';
    // 만약 같은 컬럼을 다시 클릭했다면, 정렬 방향을 변경
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    } 
    // 만약 내림차순 상태에서 같은 컬럼을 다시 클릭했다면, 정렬 해제
    else if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'descending'
    ) {
        setSortConfig(null);
        return;
    }
    setSortConfig({ key, direction });
  };
  
  // 4. 현재 정렬 상태를 표시할 아이콘을 반환하는 함수
  const getSortIndicator = (columnField) => {
    if (!sortConfig || sortConfig.key !== columnField) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

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
                // 5. 헤더 클릭 이벤트 핸들러 추가
                onClick={() => col.sortable !== false && handleSort(col.field)}
                style={{
                  ...getSxStyle('& .MuiDataGrid-columnHeader'),
                  width: col.width ? `${col.width}px` : 'auto',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  padding: '0 8px',
                  textAlign: col.headerAlign || 'center',
                  // 6. 정렬 가능한 컬럼에 커서 변경
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
                  {/* 7. 정렬 방향 아이콘 표시 */}
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
          {/* 8. 원본 rows 대신 정렬된 sortedRows를 사용 */}
          {sortedRows.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              style={{
                height: `${rowHeight}px`,
                backgroundColor: selectedRowIndex === rowIndex ? '#e0e0e0' : 'inherit',
                cursor: 'pointer',
              }}
              onClick={() => {
                // 원본 배열에서의 인덱스를 찾아서 선택 상태를 관리해야 합니다.
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
};

export default MyDataGrid;