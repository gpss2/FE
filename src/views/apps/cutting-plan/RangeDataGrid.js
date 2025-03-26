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

const RangeDataGrid = ({ rows, columns, selectionModel, onRowClick }) => {
  // 헤더 및 셀 기본 스타일
  const headerCellStyle = {
    fontSize: '14px',
    backgroundColor: '#B2B2B2',
    border: '1px solid black',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.2',
    padding: '4px 8px',
    position: 'sticky', // 상단 고정을 위한 sticky
    top: 0, // 화면 상단에서 0px 위치에 고정
    zIndex: 2, // 본문보다 위에 표시되도록 zIndex 부여
  };

  const cellStyle = {
    fontSize: '12px',
    border: '1px solid black',
    padding: '2px 8px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  // 선택된 행 스타일 (선택 시 배경색 변경)
  const rowStyle = (rowId) => ({
    backgroundColor: selectionModel.includes(rowId) ? '#f0f0f0' : 'inherit',
    cursor: 'pointer',
    height: '25px',
  });

  // 각 컬럼의 너비를 관리하는 상태 (초기값은 로컬스토리지 또는 columns의 width/default 100)
  const [columnWidths, setColumnWidths] = useState({});

  useEffect(() => {
    const savedWidths = JSON.parse(localStorage.getItem('rangeDataGridColumnWidths') || '{}');
    const initialWidths = {};
    columns.forEach((col) => {
      // col.width가 없으면 기본 100px 적용
      initialWidths[col.field] = savedWidths[col.field] || col.width || 100;
    });
    setColumnWidths(initialWidths);
  }, [columns]);

  // 드래그로 컬럼 너비 조절 함수
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
              style={rowStyle(row.id)}
              onClick={() => onRowClick && onRowClick({ row })}
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
  onRowClick: PropTypes.func,
};

RangeDataGrid.defaultProps = {
  selectionModel: [],
  onRowClick: null,
};

export default RangeDataGrid;
