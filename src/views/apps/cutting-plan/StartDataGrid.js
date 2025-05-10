import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

/**
 * Custom DataGrid replacement that mimics MUI DataGrid functionality
 * with properly working resizable columns, fixed headers, sorting,
 * and a sticky TOTAL row at the bottom
 */
const StartDataGrid = ({
  rows = [],
  columns = [],
  onRowClick,
  selectionModel = [],
  rowSelectionModel = [],
  onRowSelectionModelChange,
  getRowId = (row) => row.id,
  sx = {},
  rowHeight = 25,
  columnHeaderHeight = 30,
  loading = false,
  id = 'default-grid', // Grid ID for local storage
}) => {
  // Combine selectionModel and rowSelectionModel for flexibility
  const effectiveSelectionModel = selectionModel.length > 0 ? selectionModel : rowSelectionModel;

  // State for column widths
  const [colWidths, setColWidths] = useState({});

  // State for sorting
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // References for resize operation
  const resizeColRef = useRef(null);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(0);
  const tableRef = useRef(null);

  // Load saved column widths
  useEffect(() => {
    const storageKey = `${id}-col-widths`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setColWidths(JSON.parse(saved));
      } else {
        const initialWidths = {};
        columns.forEach((col) => {
          initialWidths[col.field] = col.width || (col.flex ? col.flex * 100 : 100);
        });
        setColWidths(initialWidths);
      }
    } catch (err) {
      console.error('Error loading column widths:', err);
    }
  }, [id, columns]);

  // Save column widths
  useEffect(() => {
    if (Object.keys(colWidths).length > 0) {
      const storageKey = `${id}-col-widths`;
      localStorage.setItem(storageKey, JSON.stringify(colWidths));
    }
  }, [colWidths, id]);

  // Sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    return [...rows].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return sortDirection === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [rows, sortField, sortDirection]);

  // Resize handlers
  const handleResizeMouseDown = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    resizeColRef.current = field;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = colWidths[field] || 100;
    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };
  const handleResizeMouseMove = (e) => {
    if (!resizeColRef.current) return;
    const diffX = e.clientX - resizeStartXRef.current;
    const newWidth = Math.max(50, resizeStartWidthRef.current + diffX);
    setColWidths((prev) => ({ ...prev, [resizeColRef.current]: newWidth }));
  };
  const handleResizeMouseUp = () => {
    resizeColRef.current = null;
    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Row click and selection
  const handleRowClick = (event, row) => {
    if (onRowClick) onRowClick({ row, id: getRowId(row) });
    if (onRowSelectionModelChange) onRowSelectionModelChange([getRowId(row)]);
  };
  const isRowSelected = (row) => effectiveSelectionModel.includes(getRowId(row));

  // Cell content and sums
  const getCellContent = (row, column, index) => {
    if (column.field === 'index') return index + 1;
    if (column.renderCell) {
      return column.renderCell({
        value: row[column.field],
        row,
        field: column.field,
        api: { getSortedRowIds: () => rows.map((r) => getRowId(r)) },
        id: getRowId(row),
      });
    }
    return row[column.field];
  };
  const calculateColumnSum = (field) => {
    if (['index', 'groupNumber', 'bbCode', 'cbCode'].includes(field)) return '';
    let sum = 0;
    rows.forEach((row) => {
      const v = Number(row[field]);
      if (!isNaN(v)) sum += v;
    });
    return Number.isInteger(sum) ? sum : sum.toFixed(2);
  };

  const displayRows = sortedRows;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        position: 'relative',
        ...sx,
      }}
      ref={tableRef}
    >
      <TableContainer
        component={Paper}
        sx={{
          height: '100%',
          minHeight: '100%',
          backgroundColor: '#f5f5f5',
          boxShadow: 'none',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow style={{ height: columnHeaderHeight }}>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.headerAlign || 'center'}
                  onClick={column.field === 'groupNumber' ? () => handleSort(column.field) : undefined}
                  style={{
                    width: `${colWidths[column.field] || 100}px`,
                    minWidth: `${colWidths[column.field] || 100}px`,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    fontSize: '12px',
                    backgroundColor: '#B2B2B2',
                    border: '1px solid black',
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    padding: '2px 6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    ...(column.field === 'groupNumber' ? { cursor: 'pointer' } : {}),
                  }}
                >
                  {column.headerName}
                  {column.field === sortField && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: '10px',
                      cursor: 'col-resize',
                      zIndex: 11,
                    }}
                    onMouseDown={(e) => handleResizeMouseDown(e, column.field)}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  데이터가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              <>
                {displayRows.map((row, rowIndex) => (
                  <TableRow
                    key={getRowId(row) ?? rowIndex}
                    onClick={(e) => handleRowClick(e, row)}
                    style={{
                      height: rowHeight,
                      backgroundColor: isRowSelected(row)
                        ? 'rgba(25,118,210,0.12)'
                        : row.group === 1
                        ? '#f5f5f5'
                        : '#ffffff',
                      cursor: 'pointer',
                    }}
                    hover
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={`${getRowId(row)}-${column.field}`}
                        align={column.align || (column.field === 'index' ? 'center' : 'left')}
                        className={column.cellClassName}
                        style={{
                          width: `${colWidths[column.field] || 100}px`,
                          minWidth: `${colWidths[column.field] || 100}px`,
                          border: '1px solid black',
                          fontSize: '12px',
                          padding: '2px 6px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          ...(column.cellClassName === 'index-cell'
                            ? { backgroundColor: '#B2B2B2' }
                            : {}),
                          ...(row.error && column.field === 'error'
                            ? { backgroundColor: 'red', color: 'white' }
                            : {}),
                        }}
                      >
                        {getCellContent(row, column, rowIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Sticky Totals row at bottom for bottom-grid */}
                {id === 'bottom-grid' && rows.length > 0 && (
                  <TableRow
                    style={{
                      position: 'sticky',
                      bottom: 0,
                      zIndex: 9,
                      height: rowHeight,
                      backgroundColor: '#f0f0f0',
                      fontWeight: 'bold',
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={`total-${column.field}`}
                        align={column.align || (column.field === 'index' ? 'center' : 'left')}
                        style={{
                          width: `${colWidths[column.field] || 100}px`,
                          minWidth: `${colWidths[column.field] || 100}px`,
                          border: '1px solid black',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          backgroundColor: '#E0E0E0',
                        }}
                      >
                        {column.field === 'index'
                          ? ''
                          : column.field === 'groupNumber'
                          ? 'TOTAL'
                          : calculateColumnSum(column.field)}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StartDataGrid;
