import { useState, useEffect, useRef, useMemo } from 'react';

const ItemDataGrid = ({
  rows = [],
  columns = [],
  processRowUpdate,
  onRowClick,
  onCellDoubleClick,
  onRowUpdate,
  getRowId,
  getRowClassName,
  modalEditFields = [],
  columnHeaderHeight = 30,
  rowHeight = 25,
  sx = {},
}) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [selectedCoords, setSelectedCoords] = useState({ rowIndex: null, colIndex: null });
  const [columnWidths, setColumnWidths] = useState({});
  const [resizing, setResizing] = useState({ active: false, field: '', startX: 0, startWidth: 0 });
  const inputRef = useRef(null);

  // 1. 정렬 상태 추가
  const [sortConfig, setSortConfig] = useState(null);
  
  const editableFields = columns.filter((c) => c.editable).map((c) => c.field);

  // 2. 정렬 로직 추가 (useMemo로 성능 최적화)
  const sortedRows = useMemo(() => {
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

  // 3. 헤더 클릭 시 정렬 상태를 변경하는 함수
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
  
  // 4. 현재 정렬 상태를 표시할 아이콘을 반환하는 함수
  const getSortIndicator = (columnField) => {
    if (!sortConfig || sortConfig.key !== columnField) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  useEffect(() => {
    const savedWidths = localStorage.getItem('itemDataGridColumnWidths');
    if (savedWidths) {
      setColumnWidths(JSON.parse(savedWidths));
    } else {
      const initialWidths = {};
      columns.forEach((col) => {
        if (col.field) {
          initialWidths[col.field] = col.width ? col.width : 120;
        }
      });
      setColumnWidths(initialWidths);
    }
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('itemDataGridColumnWidths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleResizeMouseDown = (e, field) => {
    e.preventDefault();
    setResizing({
      active: true,
      field,
      startX: e.clientX,
      startWidth: columnWidths[field],
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing.active) return;
      const newWidth = Math.max(50, resizing.startWidth + (e.clientX - resizing.startX));
      setColumnWidths((prev) => ({ ...prev, [resizing.field]: newWidth }));
    };
    const handleMouseUp = () => {
      if (resizing.active) setResizing((prev) => ({ ...prev, active: false }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  const startEditing = (row, col) => {
    const rowId = getRowId(row);
    setEditingCell({ rowId, field: col.field });
    setEditingValue(row[col.field] ?? '');
  };

  const commitEdit = async () => {
    if (!editingCell) return;
    const { rowId, field } = editingCell;
    const oldRow = rows.find((r) => getRowId(r) === rowId);
    const newRow = { ...oldRow, [field]: editingValue };
    const processedRow = processRowUpdate ? await Promise.resolve(processRowUpdate(newRow, oldRow)) : newRow;
    if (onRowUpdate) {
      onRowUpdate(processedRow);
    }
    return processedRow;
  };

  const moveToNextCell = (committedRow, currentColField) => {
    const currentIndex = editableFields.indexOf(currentColField);
    if (currentIndex > -1 && currentIndex < editableFields.length - 1) {
      const nextField = editableFields[currentIndex + 1];
      startEditing(committedRow, { field: nextField });
    } else {
      setEditingCell(null);
    }
  };

  const handleCellDoubleClick = (row, col) => {
    if (modalEditFields.includes(col.field) && onCellDoubleClick) {
      onCellDoubleClick({ row, field: col.field, id: getRowId(row) });
    }
    else if (col.editable) {
      startEditing(row, col);
    }
  };

  const handleInputBlur = () => {
    commitEdit().then(() => setEditingCell(null));
  };

  const handleKeyDown = async (e, row, col, rowIndex, colIndex) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !editingCell) {
      e.preventDefault();
      let nextRow = rowIndex, nextCol = colIndex;
      if (e.key === 'ArrowUp') nextRow = Math.max(0, rowIndex - 1);
      // 5. rows.length 대신 sortedRows.length 사용
      if (e.key === 'ArrowDown') nextRow = Math.min(sortedRows.length - 1, rowIndex + 1);
      if (e.key === 'ArrowLeft') nextCol = Math.max(0, colIndex - 1); // 첫 컬럼(index 0)으로 이동 가능하도록 수정
      if (e.key === 'ArrowRight') nextCol = Math.min(columns.length - 1, colIndex + 1);
      const nextCell = document.querySelector(`[data-row-index="${nextRow}"][data-col-index="${nextCol}"]`);
      if (nextCell) nextCell.focus();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingCell) {
        const committedRow = await commitEdit();
        moveToNextCell(committedRow, col.field);
      } else {
        handleCellDoubleClick(row, col);
      }
    }

    if (e.key === 'Escape' && editingCell) {
      setEditingCell(null);
    }
  };

  const handleRowClick = (row, rowIndex) => {
    if (onRowClick) {
      onRowClick({ id: getRowId(row), row });
    }
    setSelectedCoords({ rowIndex, colIndex: selectedCoords.colIndex });
  };

  const getSxStyle = (key) => sx[key] || {};

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto', border: '1px solid black' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'white' }}>
          <tr style={{ height: `${columnHeaderHeight}px` }}>
            {columns.map((col) => (
              <th
                key={col.field}
                // 6. 리사이즈 핸들이 아닌 헤더 영역 클릭 시 정렬되도록 onClick 추가
                onClick={() => col.sortable !== false && handleSort(col.field)}
                style={{
                  ...getSxStyle('& .MuiDataGrid-columnHeader'),
                  width: `${columnWidths[col.field] || 120}px`,
                  textAlign: 'center',
                  position: 'relative',
                  // 7. 정렬 가능 컬럼에 커서 변경
                  cursor: col.sortable !== false ? 'pointer' : 'default',
                }}
              >
                {/* 헤더 텍스트와 정렬 아이콘을 함께 표시 */}
                {col.headerName}
                {getSortIndicator(col.field)}

                {/* 리사이즈 핸들은 그대로 유지 */}
                <div
                  onMouseDown={(e) => handleResizeMouseDown(e, col.field)}
                  // 클릭 이벤트가 th로 전파되는 것을 막아 정렬과 리사이즈가 동시에 실행되지 않도록 함
                  onClick={(e) => e.stopPropagation()} 
                  style={{ position: 'absolute', top: 0, right: 0, width: '5px', height: '100%', cursor: 'col-resize', userSelect: 'none' }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 8. 원본 rows 대신 정렬된 sortedRows를 사용 */}
          {sortedRows.map((row, rowIndex) => {
            const rowId = getRowId(row);
            const rowClassName = getRowClassName ? getRowClassName({ row, id: rowId }) : '';
            return (
              <tr
                key={rowId}
                className={rowClassName}
                style={{ height: `${rowHeight}px`, backgroundColor: selectedCoords.rowIndex === rowIndex ? '#e0e0e0' : undefined }}
                onClick={() => handleRowClick(row, rowIndex)}
              >
                {columns.map((col, colIndex) => {
                  const isEditing = editingCell?.rowId === rowId && editingCell?.field === col.field;
                  const cellClassName = col.cellClassName || '';
                  return (
                    <td
                      key={col.field}
                      data-row-index={rowIndex}
                      data-col-index={colIndex}
                      tabIndex={0}
                      className={cellClassName}
                      style={{ ...getSxStyle('& .MuiDataGrid-cell'), textAlign: col.align || 'center', padding: '0 4px' }}
                      onFocus={() => setSelectedCoords({ rowIndex, colIndex })}
                      onDoubleClick={() => handleCellDoubleClick(row, col)}
                      onKeyDown={(e) => handleKeyDown(e, row, col, rowIndex, colIndex)}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={handleInputBlur}
                          style={{ width: '100%', boxSizing: 'border-box', height: '100%', border: '1px solid #1976d2', outline: 'none', textAlign: 'center' }}
                        />
                      ) : col.renderCell ? (
                        col.renderCell({ api: { getSortedRowIds: () => sortedRows.map(getRowId) }, id: rowId, row })
                      ) : (
                        row[col.field]
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ItemDataGrid;