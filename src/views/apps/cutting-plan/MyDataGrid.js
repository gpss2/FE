import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Modal, Box, Typography } from '@mui/material';

const MyDataGrid = ({
  rows = [],
  columns = [],
  processRowUpdate, // (newRow, oldRow) => updatedRow
  onRowClick,
  onCellDoubleClick,
  onCellKeyDown,
  onRowUpdate, // 수정 후 업데이트된 행을 부모에 전달하는 콜백
}) => {
  const [editingCell, setEditingCell] = useState(null); // { rowId, field }
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef(null);

  // 행 전체 선택 상태: 현재 포커스된 행의 인덱스
  const [selectedRow, setSelectedRow] = useState(null);

  // specCode 전용 모달 상태
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [specOptions, setSpecOptions] = useState([]); // /api/item/specific의 결과 (table 배열)
  const [currentSpecEditing, setCurrentSpecEditing] = useState(null); // { row, col }
  const [specSearch, setSpecSearch] = useState(''); // 검색어

  // 편집 가능한 필드 목록 (더블클릭으로 편집 가능)
  const editableFields = [
    'itemType',
    'itemName',
    // 'specCode', // specCode는 별도 모달로 처리
    'endBar',
    'width_mm',
    'length_mm',
    'cbCount',
    'lep_mm',
    'rep_mm',
    'quantity',
  ];

  // ---------------------------
  // 1) 컬럼 너비 상태 & 로컬 스토리지 연동
  // ---------------------------
  const [columnWidths, setColumnWidths] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('myDataGridColumnWidths');
    if (saved) {
      setColumnWidths(JSON.parse(saved));
    } else {
      const initial = {};
      columns.forEach((col) => {
        if (col.field) {
          initial[col.field] = col.width ? parseInt(col.width, 10) : 100;
        }
      });
      setColumnWidths(initial);
    }
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('myDataGridColumnWidths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // ---------------------------
  // 2) 컬럼 리사이즈 로직
  // ---------------------------
  const [resizing, setResizing] = useState({
    active: false,
    startX: 0,
    field: '',
    startWidth: 0,
  });

  const handleResizeMouseDown = (e, colField) => {
    e.preventDefault();
    setResizing({
      active: true,
      startX: e.clientX,
      field: colField,
      startWidth: columnWidths[colField] || 100,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing.active) return;
      const deltaX = e.clientX - resizing.startX;
      const newWidth = Math.max(50, resizing.startWidth + deltaX);
      setColumnWidths((prev) => ({ ...prev, [resizing.field]: newWidth }));
    };

    const handleMouseUp = () => {
      if (resizing.active) {
        setResizing((prev) => ({ ...prev, active: false }));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  // ---------------------------
  // 3) 셀 편집 로직 (편집 시 전체 선택)
  // ---------------------------
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // specCode 셀은 더블클릭 시 바로 모달을 열도록 수정
  const handleCellDoubleClickInternal = (row, col) => {
    if (col.field === 'specCode') {
      openSpecModal(row, col);
      return;
    }
    if (!editableFields.includes(col.field)) return;
    setEditingCell({ rowId: row.id, field: col.field });
    setEditingValue(row[col.field] ?? '');
    if (onCellDoubleClick) {
      onCellDoubleClick({ row, field: col.field });
    }
  };

  const handleCellKeyDownInternal = (row, col, event, rowIndex, colIndex) => {
    if (col.field === 'specCode') {
      // specCode는 키보드로 편집하지 않고 모달로 선택
      if (event.key === 'Enter') {
        event.preventDefault();
        openSpecModal(row, col);
      }
      return;
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      handleArrowNavigation(rowIndex, colIndex, event.key);
      return;
    }
    if (!editableFields.includes(col.field)) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!editingCell || editingCell.rowId !== row.id || editingCell.field !== col.field) {
        setEditingCell({ rowId: row.id, field: col.field });
        setEditingValue(row[col.field] ?? '');
      } else {
        commitEdit(row, col);
      }
    } else {
      if (onCellKeyDown) {
        onCellKeyDown({ row, field: col.field }, event);
      }
    }
  };

  const commitEdit = (row, col) => {
    const newValue = editingValue;
    const newRow = { ...row, [col.field]: newValue };
    let updatedRow = newRow;
    if (processRowUpdate) {
      updatedRow = processRowUpdate(newRow, row);
    }
    if (onRowUpdate) {
      onRowUpdate(updatedRow);
    }
    moveToNextCell(row, col);
  };

  // quantity 셀에서 엔터 시 다음 행의 'width_mm'로, 그 외엔 순서대로 이동
  const moveToNextCell = (row, col) => {
    if (col.field === 'quantity') {
      const currentRowIndex = rows.findIndex((r) => r.id === row.id);
      if (currentRowIndex !== -1 && currentRowIndex < rows.length - 1) {
        const nextRow = rows[currentRowIndex + 1];
        setEditingCell({ rowId: nextRow.id, field: 'width_mm' });
        setEditingValue(nextRow['width_mm'] ?? '');
      } else {
        setEditingCell(null);
      }
    } else {
      const currentIndex = editableFields.indexOf(col.field);
      if (currentIndex !== -1 && currentIndex < editableFields.length - 1) {
        const nextField = editableFields[currentIndex + 1];
        setEditingCell({ rowId: row.id, field: nextField });
        setEditingValue(row[nextField] ?? '');
      } else {
        setEditingCell(null);
      }
    }
  };

  const handleInputBlur = (row, col) => {
    if (editingCell && editingCell.rowId === row.id && editingCell.field === col.field) {
      commitEdit(row, col);
      setEditingCell(null);
    }
  };

  // ---------------------------
  // 4) 방향키 이동 처리
  // ---------------------------
  const handleArrowNavigation = (rowIndex, colIndex, key) => {
    let newRowIndex = rowIndex;
    let newColIndex = colIndex;
    if (key === 'ArrowRight') {
      newColIndex = colIndex + 1;
      if (newColIndex >= columns.length + 1) newColIndex = columns.length;
    } else if (key === 'ArrowLeft') {
      newColIndex = colIndex - 1;
      if (newColIndex < 0) newColIndex = 0;
    } else if (key === 'ArrowDown') {
      newRowIndex = rowIndex + 1;
      if (newRowIndex >= rows.length) newRowIndex = rows.length - 1;
    } else if (key === 'ArrowUp') {
      newRowIndex = rowIndex - 1;
      if (newRowIndex < 0) newRowIndex = 0;
    }
    const nextCell = document.querySelector(
      `[data-row-index="${newRowIndex}"][data-col-index="${newColIndex}"]`,
    );
    if (nextCell) {
      nextCell.focus();
    }
  };

  // ---------------------------
  // 5) specCode 모달 처리 (검색 포함)
  // ---------------------------
  const openSpecModal = (row, col) => {
    setCurrentSpecEditing({ row, col });
    axios
      .get('/api/item/specific')
      .then((response) => {
        if (response.data && response.data.table) {
          setSpecOptions(response.data.table);
        } else {
          setSpecOptions([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching spec options:', error);
        setSpecOptions([]);
      });
    setSpecModalOpen(true);
    setSpecSearch(''); // 검색 초기화
  };

  const handleSpecSelect = (specRow) => {
    if (currentSpecEditing) {
      const { row, col } = currentSpecEditing;
      const newRow = { ...row, specCode: specRow.systemCode };
      let updatedRow = newRow;
      if (processRowUpdate) {
        updatedRow = processRowUpdate(newRow, row);
      }
      if (onRowUpdate) {
        onRowUpdate(updatedRow);
      }
    }
    setSpecModalOpen(false);
    setCurrentSpecEditing(null);
  };

  const handleSpecModalClose = () => {
    setSpecModalOpen(false);
    setCurrentSpecEditing(null);
  };

  // 정규표현식으로 검색어와 비교값의 0 제거 후 비교
  const removeZeros = (str) => str.replace(/0/g, '');
  const filteredSpecOptions = specOptions.filter((spec) => {
    const searchStr = removeZeros(specSearch.toLowerCase());
    const systemCode = removeZeros(spec.systemCode.toLowerCase());
    const bbCode = removeZeros(spec.bbCode.toLowerCase());
    const cbCode = removeZeros(spec.cbCode.toLowerCase());
    return (
      systemCode.includes(searchStr) || bbCode.includes(searchStr) || cbCode.includes(searchStr)
    );
  });

  // ---------------------------
  // 6) 렌더링
  // ---------------------------
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          tableLayout: 'fixed',
        }}
      >
        <thead>
          <tr>
            {/* 인덱스 컬럼: data-col-index 0 */}
            <th
              data-col-index={0}
              style={{
                border: '1px solid black',
                backgroundColor: '#B2B2B2',
                fontSize: '14px',
                padding: '4px',
                textAlign: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                width: 50,
              }}
            >
              번호
            </th>
            {columns.map((col, index) => {
              const colWidth = columnWidths[col.field] ?? parseInt(col.width || 100, 10);
              return (
                <th
                  key={col.field || index}
                  data-col-index={index + 1}
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    border: '1px solid black',
                    backgroundColor: '#B2B2B2',
                    fontSize: '14px',
                    padding: '4px',
                    textAlign: col.headerAlign || 'center',
                    width: colWidth,
                  }}
                >
                  {col.headerName}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '5px',
                      cursor: 'col-resize',
                      userSelect: 'none',
                      height: '100%',
                    }}
                    onMouseDown={(e) => handleResizeMouseDown(e, col.field)}
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              style={{
                backgroundColor:
                  selectedRow === rowIndex ? '#bae7ff' : row.group === 0 ? '#ffffff' : '#f5f5f5',
                cursor: onRowClick ? 'pointer' : 'default',
              }}
              onClick={() => {
                onRowClick && onRowClick(row);
                setSelectedRow(rowIndex);
              }}
            >
              {/* 인덱스 셀 */}
              <td
                data-row-index={rowIndex}
                data-col-index={0}
                style={{
                  border: '1px solid black',
                  fontSize: '12px',
                  padding: '2px 4px',
                  textAlign: 'center',
                  width: 50,
                }}
                tabIndex={0}
                onFocus={() => setSelectedRow(rowIndex)}
                onKeyDown={(event) => handleArrowNavigation(rowIndex, 0, event.key)}
              >
                {rowIndex + 1}
              </td>
              {columns.map((col, colIndex) => {
                if (col.field === 'specCode') {
                  return (
                    <td
                      key={col.field || colIndex}
                      data-row-index={rowIndex}
                      data-col-index={colIndex + 1}
                      style={{
                        border: '1px solid black',
                        fontSize: '12px',
                        padding: '2px 4px',
                        textAlign: 'center',
                        width: columnWidths[col.field] ?? parseInt(col.width || 100, 10),
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                      tabIndex={0}
                      onFocus={() => setSelectedRow(rowIndex)}
                    >
                      <button
                        onClick={() => openSpecModal(row, col)}
                        style={{
                          width: '100%',
                          height: '100%',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {row.specCode ? row.specCode : '선택'}
                      </button>
                    </td>
                  );
                }
                const isEditing =
                  editingCell && editingCell.rowId === row.id && editingCell.field === col.field;
                const cellValue = row[col.field];
                const cellClassName =
                  typeof col.cellClassName === 'function' ? col.cellClassName({ row }) : '';
                const colWidth = columnWidths[col.field] ?? parseInt(col.width || 100, 10);
                const dataColIndex = colIndex + 1;
                return (
                  <td
                    key={col.field || colIndex}
                    data-row-index={rowIndex}
                    data-col-index={dataColIndex}
                    className={cellClassName}
                    style={{
                      border: '1px solid black',
                      fontSize: '12px',
                      padding: '2px 4px',
                      textAlign: 'center',
                      width: colWidth,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                    tabIndex={0}
                    onFocus={() => setSelectedRow(rowIndex)}
                    onDoubleClick={() => handleCellDoubleClickInternal(row, col)}
                    onKeyDown={(event) =>
                      handleCellKeyDownInternal(row, col, event, rowIndex, dataColIndex)
                    }
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        value={editingValue}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setEditingValue(newVal);
                          // 즉시 업데이트: 현재 row의 값을 갱신
                          const newRow = { ...row, [col.field]: newVal };
                          let updatedRow = newRow;
                          if (processRowUpdate) {
                            updatedRow = processRowUpdate(newRow, row);
                          }
                          if (onRowUpdate) {
                            onRowUpdate(updatedRow);
                          }
                        }}
                        onBlur={() => handleInputBlur(row, col)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            commitEdit(row, col);
                          }
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          boxSizing: 'border-box',
                          fontSize: '12px',
                          padding: '2px',
                          margin: 0,
                          border: 'none',
                          outline: 'none',
                        }}
                      />
                    ) : (
                      cellValue
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* specCode 선택 모달 */}
      <Modal open={specModalOpen} onClose={handleSpecModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            height: 600, // 고정 높이, 내부 내용 스크롤
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" mb={2}>
            사양코드 선택
          </Typography>
          <input
            type="text"
            value={specSearch}
            onChange={(e) => setSpecSearch(e.target.value)}
            placeholder="검색..."
            style={{ marginBottom: '10px', width: '100%', padding: '4px' }}
          />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '4px' }}>번호</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>SystemCode</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>BB 코드</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>CB 코드</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>B 피치</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>C 피치</th>
                <th style={{ border: '1px solid black', padding: '4px' }}>톱날 두께</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecOptions.map((spec, index) => (
                <tr
                  key={index}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSpecSelect(spec)}
                >
                  <td style={{ border: '1px solid black', padding: '4px' }}>{index + 1}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{spec.systemCode}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{spec.bbCode}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{spec.cbCode}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{spec.bWidth}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{spec.cWidth}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>
                    {spec.bladeThickness}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Modal>
    </div>
  );
};

export default MyDataGrid;
