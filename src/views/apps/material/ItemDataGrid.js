import { useState, useEffect, useRef } from 'react';

const ItemDataGrid = ({
  rows = [],
  columns = [],
  processRowUpdate,
  onRowClick,
  onCellDoubleClick,
  onRowUpdate,
  getRowId,
  getRowClassName,
  // highlight-next-line
  modalEditFields = [], // modal을 사용할 필드 목록을 prop으로 받음
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

  const editableFields = columns.filter((c) => c.editable).map((c) => c.field);

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

  // highlight-start
  const handleCellDoubleClick = (row, col) => {
    // 1. modalEditFields 목록에 포함된 필드이고, onCellDoubleClick prop이 존재하면 모달을 호출
    if (modalEditFields.includes(col.field) && onCellDoubleClick) {
      onCellDoubleClick({ row, field: col.field, id: getRowId(row) });
    }
    // 2. 그 외의 수정 가능한(editable) 필드는 인라인 편집 시작
    else if (col.editable) {
      startEditing(row, col);
    }
  };
  // highlight-end

  const handleInputBlur = () => {
    commitEdit().then(() => setEditingCell(null));
  };

  const handleKeyDown = async (e, row, col, rowIndex, colIndex) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !editingCell) {
      e.preventDefault();
      let nextRow = rowIndex,
        nextCol = colIndex;
      if (e.key === 'ArrowUp') nextRow = Math.max(0, rowIndex - 1);
      if (e.key === 'ArrowDown') nextRow = Math.min(rows.length - 1, rowIndex + 1);
      if (e.key === 'ArrowLeft') nextCol = Math.max(1, colIndex - 1);
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
        // 엔터 키를 눌렀을 때도 더블클릭과 동일한 로직으로 처리
        handleCellDoubleClick(row, col);
      }
    }

    if (e.key === 'Escape' && editingCell) {
      setEditingCell(null);
    }
  };

  const handleRowClick = (row, rowIndex) => {
    if (onRowClick) {
      onRowClick({ id: getRowId(row) });
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