import React, { useState, useEffect, useRef } from 'react';
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
 * with properly working resizable columns and fixed headers
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

  // References for resize operation
  const resizeColRef = useRef(null);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(0);
  const tableRef = useRef(null);

  // Effect to load saved column widths
  useEffect(() => {
    const storageKey = `${id}-col-widths`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setColWidths(JSON.parse(saved));
      } else {
        // Initialize with default widths
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

  // Save column widths to localStorage when they change
  useEffect(() => {
    if (Object.keys(colWidths).length > 0) {
      const storageKey = `${id}-col-widths`;
      localStorage.setItem(storageKey, JSON.stringify(colWidths));
    }
  }, [colWidths, id]);

  // Event handlers for column resizing
  const handleResizeMouseDown = (e, field) => {
    e.preventDefault();
    e.stopPropagation();

    resizeColRef.current = field;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = colWidths[field] || 100;

    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);

    // Add a class to the body to indicate resizing
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResizeMouseMove = (e) => {
    if (!resizeColRef.current) return;

    const diffX = e.clientX - resizeStartXRef.current;
    const newWidth = Math.max(50, resizeStartWidthRef.current + diffX);

    setColWidths((prev) => ({
      ...prev,
      [resizeColRef.current]: newWidth,
    }));
  };

  const handleResizeMouseUp = () => {
    resizeColRef.current = null;

    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);

    // Reset body styles
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Handle row click
  const handleRowClick = (event, row) => {
    if (onRowClick) {
      // Mimic DataGrid params structure
      onRowClick({ row, id: getRowId(row) });
    }

    if (onRowSelectionModelChange) {
      const rowId = getRowId(row);
      onRowSelectionModelChange([rowId]);
    }
  };

  // Generate cell content based on column definition or index
  const getCellContent = (row, column, index) => {
    // Special handling for index column
    if (column.field === 'index') {
      return index + 1;
    }

    // If column has renderCell function
    if (column.renderCell) {
      return column.renderCell({
        value: row[column.field],
        row,
        field: column.field,
        api: {
          getSortedRowIds: () => rows.map((r) => getRowId(r)),
        },
        id: getRowId(row),
      });
    }

    // Default: return cell value
    return row[column.field];
  };

  // Check if a row is selected
  const isRowSelected = (row) => {
    const rowId = getRowId(row);
    return effectiveSelectionModel.includes(rowId);
  };

  // Calculate sum for each column
  const calculateColumnSum = (field) => {
    // Don't calculate sum for non-numeric columns
    if (field === 'index' || field === 'groupNumber' || field === 'bbCode' || field === 'cbCode') {
      return '';
    }

    let sum = 0;
    rows.forEach((row) => {
      const value = Number(row[field]);
      if (!isNaN(value)) {
        sum += value;
      }
    });

    // Show up to 2 decimal places
    return Number.isInteger(sum) ? sum : sum.toFixed(2);
  };

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
          position: 'relative', // Added for proper stacking context
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow style={{ height: columnHeaderHeight }}>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.headerAlign || 'center'}
                  style={{
                    width: `${colWidths[column.field] || 100}px`,
                    minWidth: `${colWidths[column.field] || 100}px`,
                    position: 'sticky', // Ensure stickiness
                    top: 0, // Stick to the top
                    zIndex: 10, // Higher than regular content
                    fontSize: '12px',
                    backgroundColor: '#B2B2B2', // Background color for header
                    border: '1px solid black',
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    padding: '2px 6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {column.headerName}
                  {/* Resize handle */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: '10px',
                      cursor: 'col-resize',
                      zIndex: 11, // Higher than header cells
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
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  데이터가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rows.map((row, rowIndex) => (
                  <TableRow
                    key={getRowId(row) || rowIndex}
                    onClick={(event) => handleRowClick(event, row)}
                    style={{
                      height: rowHeight,
                      backgroundColor: isRowSelected(row)
                        ? 'rgba(25, 118, 210, 0.12)'
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
                          paddingTop: '2px',
                          paddingBottom: '2px',
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

                {/* Show totals row only for bottom-grid */}
                {id === 'bottom-grid' && rows.length > 0 && (
                  <TableRow
                    style={{
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
                          paddingTop: '2px',
                          paddingBottom: '2px',
                          padding: '2px 6px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          backgroundColor: '#E0E0E0',
                        }}
                      >
                        {/* First column (index) is empty */}
                        {column.field === 'index'
                          ? ''
                          : /* Show 'TOTAL' in the groupNumber column */
                          column.field === 'groupNumber'
                          ? 'TOTAL'
                          : /* Show sum for other columns */
                            calculateColumnSum(column.field)}
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
