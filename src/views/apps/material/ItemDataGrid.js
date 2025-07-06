import { useState, useEffect, useRef } from 'react';

const ItemDataGrid = ({
  rows = [],
  columns = [],
  processRowUpdate, // (newRow, oldRow) => updatedRow
  onRowClick,
  onCellDoubleClick,
  onRowUpdate, // 부모의 주 데이터(data)를 업데이트하는 콜백
  getRowId,
  getRowClassName,
  columnHeaderHeight = 30,
  rowHeight = 25,
  sx = {},
}) => {
  const [editingCell, setEditingCell] = useState(null); // { rowId, field }
  const [editingValue, setEditingValue] = useState('');
  const [selectedCoords, setSelectedCoords] = useState({ rowIndex: null, colIndex: null });
  const [columnWidths, setColumnWidths] = useState({});
  const [resizing, setResizing] = useState({ active: false, field: '', startX: 0, startWidth: 0 });
  const inputRef = useRef(null);

  const editableFields = columns.filter((c) => c.editable).map((c) => c.field);

  // 1. 컬럼 너비 관리 (로컬 스토리지 연동)
  useEffect(() => {
    const savedWidths = localStorage.getItem('itemDataGridColumnWidths');
    if (savedWidths) {
      setColumnWidths(JSON.parse(savedWidths));
    } else {
      const initialWidths = {};
      columns.forEach((col) => {
        if (col.field) {
          initialWidths[col.field] = col.width ? col.width : 120; // flex 대신 기본 너비 설정
        }
      });
      setColumnWidths(initialWidths);
    }
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('itemDataGridColumnWidths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // 2. 컬럼 리사이징 이벤트 핸들러
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

  // 3. 셀 편집 로직
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

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

    // processRowUpdate가 있으면 실행하고 결과값으로 최종 행 결정
    const processedRow = processRowUpdate ? await Promise.resolve(processRowUpdate(newRow, oldRow)) : newRow;

    // 부모의 주 데이터(data) 업데이트
    if (onRowUpdate) {
      onRowUpdate(processedRow);
    }

    return processedRow; // 다음 셀 이동 로직에서 사용하기 위해 반환
  };

  const moveToNextCell = (committedRow, currentColField) => {
    const currentIndex = editableFields.indexOf(currentColField);
    if (currentIndex > -1 && currentIndex < editableFields.length - 1) {
      const nextField = editableFields[currentIndex + 1];
      startEditing(committedRow, { field: nextField });
    } else {
      setEditingCell(null); // 마지막 셀이면 편집 종료
    }
  };

  // 4. 키보드 & 마우스 이벤트 핸들러
  const handleCellDoubleClick = (row, col) => {
    // onCellDoubleClick prop이 있으면 우선적으로 실행 (모달 띄우기용)
    if (onCellDoubleClick) {
      onCellDoubleClick({ row, field: col.field, id: getRowId(row) });
      return;
    }
    if (col.editable) {
      startEditing(row, col);
    }
  };

  const handleInputBlur = () => {
    commitEdit().then(() => setEditingCell(null));
  };

  const handleKeyDown = async (e, row, col, rowIndex, colIndex) => {
    const rowId = getRowId(row);

    // 방향키 탐색
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !editingCell) {
      e.preventDefault();
      let nextRow = rowIndex, nextCol = colIndex;
      if (e.key === 'ArrowUp') nextRow = Math.max(0, rowIndex - 1);
      if (e.key === 'ArrowDown') nextRow = Math.min(rows.length - 1, rowIndex + 1);
      if (e.key === 'ArrowLeft') nextCol = Math.max(1, colIndex - 1); // 0은 인덱스 컬럼
      if (e.key === 'ArrowRight') nextCol = Math.min(columns.length, colIndex + 1);
      
      const nextCell = document.querySelector(`[data-row-index="${nextRow}"][data-col-index="${nextCol}"]`);
      if (nextCell) nextCell.focus();
      return;
    }

    // Enter 키 처리
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingCell) {
        const committedRow = await commitEdit();
        moveToNextCell(committedRow, col.field);
      } else if (col.editable) {
        startEditing(row, col);
      }
    }

    // Escape 키 처리
    if (e.key === 'Escape' && editingCell) {
      setEditingCell(null);
    }
  };

  const handleRowClick = (row, rowIndex) => {
    if (onRowClick) {
        onRowClick({ id: getRowId(row) });
    }
    setSelectedCoords({ rowIndex, colIndex: selectedCoords.colIndex });
  }

  // 5. 렌더링
  const getSxStyle = (key) => sx[key] || {};

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto', border: '1px solid black' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'white' }}>
          <tr style={{ height: `${columnHeaderHeight}px` }}>
            {columns.map((col, index) => (
              <th
                key={col.field}
                style={{
                  ...getSxStyle('& .MuiDataGrid-columnHeader'),
                  width: `${columnWidths[col.field] || 120}px`,
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {col.headerName}
                <div
                  onMouseDown={(e) => handleResizeMouseDown(e, col.field)}
                  style={{ position: 'absolute', top: 0, right: 0, width: '5px', height: '100%', cursor: 'col-resize', userSelect: 'none' }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
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
                      data-col-index={colIndex + 1} // 인덱스 컬럼을 0으로 가정하지 않고 실제 컬럼 인덱스 사용
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
                        col.renderCell({ api: { getSortedRowIds: () => rows.map(getRowId) }, id: rowId })
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