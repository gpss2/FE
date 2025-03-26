import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const RangeDataGrid = ({ rows, columns, selectionModel, mergeSelection, onRowClick }) => {
  // 헤더 및 셀 기본 스타일
  const headerCellStyle = {
    fontSize: '14px',
    backgroundColor: '#B2B2B2',
    border: '1px solid black',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.2',
    padding: '4px 8px',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  };

  const cellStyle = {
    fontSize: '12px',
    border: '1px solid black',
    padding: '2px 8px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  // 행 스타일: 각 행의 그룹 식별자( row.groupNumber 또는 row.drawingNumber )를 기준으로 mergeSelection에 포함되면 연두/보라, 그렇지 않으면 일반 선택(회색)
  const rowStyle = (row) => {
    const groupIdentifier = row.groupNumber !== null ? row.groupNumber : row.drawingNumber;
    let backgroundColor = 'inherit';
    if (mergeSelection && mergeSelection.includes(groupIdentifier)) {
      const idx = mergeSelection.indexOf(groupIdentifier);
      backgroundColor = idx % 2 === 0 ? 'lightgreen' : 'yellow';
    } else if (selectionModel && selectionModel.includes(row.id)) {
      backgroundColor = '#f0f0f0';
    }
    return { backgroundColor, cursor: 'pointer', height: '25px' };
  };

  // 각 컬럼의 너비 관리 (로컬스토리지에서 불러오거나 기본값 사용)
  const [columnWidths, setColumnWidths] = useState({});

  useEffect(() => {
    const savedWidths = JSON.parse(localStorage.getItem('rangeDataGridColumnWidths') || '{}');
    const initialWidths = {};
    columns.forEach((col) => {
      initialWidths[col.field] = savedWidths[col.field] || col.width || 100;
    });
    setColumnWidths(initialWidths);
  }, [columns]);

  // 드래그로 컬럼 너비 조절
  const handleMouseDown = (e, field) => {
    e.preventDefault();
    const startX = e.clientX;
    const initialWidth = columnWidths[field];

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(initialWidth + deltaX, 50); // 최소 너비 50px
      setColumnWidths((prev) => {
        const updated = { ...prev, [field]: newWidth };
        localStorage.setItem('rangeDataGridColumnWidths', JSON.stringify(updated));
        return updated;
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 'calc(50vh)', overflow: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow style={{ height: '40px' }}>
            {columns.map((col) => (
              <TableCell
                key={col.field}
                style={{
                  ...headerCellStyle,
                  width: columnWidths[col.field],
                }}
              >
                {col.headerName}
                {/* 드래그 핸들 */}
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: '100%',
                    width: '5px',
                    cursor: 'col-resize',
                    userSelect: 'none',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, col.field)}
                />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.id || index}
              style={rowStyle(row)}
              onClick={(e) => onRowClick && onRowClick(e, { row })}
            >
              {columns.map((col) => {
                const cellStyles = { ...cellStyle, width: columnWidths[col.field] };
                if (col.field === 'index') {
                  cellStyles.backgroundColor = '#B2B2B2';
                }
                let cellContent;
                if (col.field === 'index') {
                  cellContent = index + 1;
                } else if (col.renderCell) {
                  cellContent = col.renderCell({
                    row,
                    value: row[col.field],
                    id: row.id,
                    field: col.field,
                    index,
                  });
                } else {
                  cellContent = row[col.field];
                }
                return (
                  <TableCell key={col.field} style={cellStyles}>
                    {cellContent}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

RangeDataGrid.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  selectionModel: PropTypes.array,
  mergeSelection: PropTypes.array,
  onRowClick: PropTypes.func,
};

RangeDataGrid.defaultProps = {
  selectionModel: [],
  mergeSelection: [],
  onRowClick: null,
};

export default RangeDataGrid;
