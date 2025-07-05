import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Modal, Box, Typography, Autocomplete, TextField } from '@mui/material';

// Helper function to create a global stylesheet for the grid
const createGridStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .grid-error-row > td {
      background-color: #ffcccc !important; /* Light red for error rows */
    }
  `;
  document.head.appendChild(style);
  return () => document.head.removeChild(style); // Cleanup function
};

const ItemDataGrid = ({
  rows = [],
  columns = [],
  processRowUpdate, // (newRow, oldRow) => updatedRow
  onRowUpdateCommitted, // (updatedRow) => void (to update parent state)
  onRowClick,
  getRowClassName,
}) => {
  const [editingCell, setEditingCell] = useState(null); // { rowId, field }
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Modal state for 'systemCode' selection
  const [systemCodeModalOpen, setSystemCodeModalOpen] = useState(false);
  const [systemCodeOptions, setSystemCodeOptions] = useState([]);
  const [currentSystemCodeEditing, setCurrentSystemCodeEditing] = useState(null); // { row, col }
  const [systemCodeSearch, setSystemCodeSearch] = useState('');

  // Options for Autocomplete editors
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [endBarOptions, setEndBarOptions] = useState([]);
  const itemTypeOptions = ['R', 'C', 'Angle 대', 'Angle 소', 'EndBar', 'GB', '각 Pipe', '특수 Type'];

  // Helper to get initial value for editor, applying defaults if necessary
  const getInitialEditingValue = (row, field) => {
    return row[field] ?? '';
  };

  // 1. Column Width Management (with localStorage)
  const [columnWidths, setColumnWidths] = useState({});

  useEffect(() => {
    const savedWidths = localStorage.getItem('itemDataGridColumnWidths');
    if (savedWidths) {
      setColumnWidths(JSON.parse(savedWidths));
    } else {
      const initialWidths = {};
      columns.forEach((col) => {
        if (col.field) {
          initialWidths[col.field] = col.width || 150; // Default width
        }
      });
      setColumnWidths(initialWidths);
    }
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('itemDataGridColumnWidths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // 2. Column Resizing Logic
  const [resizing, setResizing] = useState({ active: false, startX: 0, field: '', startWidth: 0 });

  const handleResizeMouseDown = (e, colField) => {
    e.preventDefault();
    setResizing({
      active: true,
      startX: e.clientX,
      field: colField,
      startWidth: columnWidths[colField],
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing.active) return;
      const deltaX = e.clientX - resizing.startX;
      const newWidth = Math.max(50, resizing.startWidth + deltaX); // Min width 50px
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

  // 3. Data Fetching for Editors
  useEffect(() => {
    axios.get('/api/item/specific').then((res) => setSystemCodeOptions(res.data?.table || []));
    axios.get('/api/item/standard').then((res) => setItemNameOptions(res.data?.table.map(item => item.itemName) || []));
    axios.get('/api/item/material').then((res) => setEndBarOptions(res.data?.table.map(item => item.materialCode) || []));
    
    // Inject global styles for the grid
    const cleanupStyles = createGridStyles();
    return cleanupStyles;
  }, []);


  // 4. Cell Editing & Commit Logic
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);
  
  const commitEdit = (row, col) => {
    const newRow = { ...row, [col.field]: editingValue };
    let processedRow = newRow;
    
    // Call the parent's processing logic (for calculations, etc.)
    if (processRowUpdate) {
        processedRow = processRowUpdate(newRow, row);
    }

    // Notify the parent component to update its master data state
    if (onRowUpdateCommitted) {
        onRowUpdateCommitted(processedRow);
    }
    
    setEditingCell(null);
  };
  
  const handleInputBlur = (row, col) => {
    if (editingCell && editingCell.rowId === row.id && editingCell.field === col.field) {
      commitEdit(row, col);
    }
  };
  
  const handleCellDoubleClick = (row, col) => {
    if (!col.editable) return;

    if (col.field === 'systemCode') {
      openSystemCodeModal(row, col);
      return;
    }

    setEditingCell({ rowId: row.id, field: col.field });
    setEditingValue(getInitialEditingValue(row, col.field));
  };
  
  const handleCellKeyDown = (e, row, col) => {
    if (e.key === 'Enter' && col.editable) {
      e.preventDefault();
      if (editingCell && editingCell.rowId === row.id && editingCell.field === col.field) {
        commitEdit(row, col);
      } else {
        handleCellDoubleClick(row, col); // Enter to start editing
      }
    }
  };


  // 5. 'systemCode' Modal Logic
  const openSystemCodeModal = (row, col) => {
    setCurrentSystemCodeEditing({ row, col });
    setSystemCodeModalOpen(true);
    setSystemCodeSearch('');
  };

  const handleSystemCodeSelect = (specRow) => {
    if (currentSystemCodeEditing) {
      const { row } = currentSystemCodeEditing;
      const newRow = { ...row, systemCode: specRow.systemCode };
      
      let processedRow = newRow;
      if (processRowUpdate) {
        processedRow = processRowUpdate(newRow, row);
      }
      if (onRowUpdateCommitted) {
        onRowUpdateCommitted(processedRow);
      }
    }
    setSystemCodeModalOpen(false);
    setCurrentSystemCodeEditing(null);
  };

  const filteredSystemCodeOptions = systemCodeOptions.filter((spec) => {
    const searchStr = systemCodeSearch.toLowerCase().replace(/0/g, '');
    return (
      (spec.systemCode || '').toLowerCase().replace(/0/g, '').includes(searchStr) ||
      (spec.bbCode || '').toLowerCase().replace(/0/g, '').includes(searchStr) ||
      (spec.cbCode || '').toLowerCase().replace(/0/g, '').includes(searchStr)
    );
  });
  
  // 6. Rendering
  const dataColumns = columns.filter(c => c.field !== 'index'); // Exclude index column from mapping

  return (
    <div style={{ height: '100%', overflow: 'auto', border: '1px solid black' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <tr>
            {/* Index Column Header */}
            <th style={{ width: 50, padding: '4px', borderRight: '1px solid black', backgroundColor: '#B2B2B2', textAlign: 'center', fontSize: '14px' }}></th>
            {dataColumns.map((col) => (
              <th key={col.field} style={{ width: columnWidths[col.field], textAlign: 'center', borderRight: '1px solid black', backgroundColor: '#B2B2B2', fontSize: '14px', padding: '4px', position: 'relative' }}>
                {col.headerName}
                <div onMouseDown={(e) => handleResizeMouseDown(e, col.field)} style={{ position: 'absolute', top: 0, right: 0, width: '5px', cursor: 'col-resize', userSelect: 'none', height: '100%' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const isEditingThisRow = editingCell && editingCell.rowId === row.id;
            const rowClassName = getRowClassName ? getRowClassName({ row }) : '';
            return (
              <tr 
                key={row.id} 
                className={rowClassName}
                style={{ backgroundColor: selectedRowIndex === rowIndex ? '#e3f2fd' : 'inherit' }}
                onClick={() => {
                  if (onRowClick) onRowClick({ id: row.id, row: row });
                  setSelectedRowIndex(rowIndex);
                }}
              >
                {/* Index Cell */}
                <td style={{ width: 50, textAlign: 'center', border: '1px solid #e0e0e0', padding: '2px 4px', fontSize: '12px', backgroundColor: '#B2B2B2' }}>
                  {rowIndex + 1}
                </td>
                {dataColumns.map((col) => {
                  const isEditing = isEditingThisRow && editingCell.field === col.field;
                  return (
                    <td
                      key={col.field}
                      style={{ border: '1px solid #e0e0e0', padding: 0, textAlign: 'center', fontSize: '12px', verticalAlign: 'middle' }}
                      onDoubleClick={() => handleCellDoubleClick(row, col)}
                      onKeyDown={(e) => handleCellKeyDown(e, row, col)}
                    >
                      {isEditing ? (
                        col.field === 'itemType' || col.field === 'itemName' || col.field === 'endBar' ? (
                          <Autocomplete
                            options={
                              col.field === 'itemType' ? itemTypeOptions :
                              col.field === 'itemName' ? itemNameOptions : endBarOptions
                            }
                            freeSolo={col.field === 'itemName'} // Allow free text for itemName
                            value={editingValue}
                            onChange={(event, newValue) => {
                              setEditingValue(newValue);
                              // Commit immediately on change for Autocomplete
                              const tempNewRow = { ...row, [col.field]: newValue };
                              const processed = processRowUpdate ? processRowUpdate(tempNewRow, row) : tempNewRow;
                              if (onRowUpdateCommitted) onRowUpdateCommitted(processed);
                              setEditingCell(null);
                            }}
                            onBlur={() => handleInputBlur(row, col)}
                            renderInput={(params) => (
                              <TextField {...params} autoFocus size="small" variant="standard" style={{ padding: '2px 4px' }} />
                            )}
                            style={{ width: '100%', backgroundColor: 'white' }}
                          />
                        ) : (
                          <input
                            ref={inputRef}
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => handleInputBlur(row, col)}
                            onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(row, col); }}
                            style={{ width: '100%', height: '100%', boxSizing: 'border-box', border: '2px solid #1976d2', outline: 'none', fontSize: '12px', textAlign: 'center' }}
                          />
                        )
                      ) : (
                        <div style={{ padding: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                           {row[col.field]}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* systemCode Selection Modal */}
      <Modal open={systemCodeModalOpen} onClose={() => setSystemCodeModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 600, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, overflowY: 'auto' }}>
          <Typography variant="h6" mb={2}>사양코드 선택</Typography>
          <TextField fullWidth value={systemCodeSearch} onChange={(e) => setSystemCodeSearch(e.target.value)} placeholder="검색..." style={{ marginBottom: '10px' }} />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['번호', 'SystemCode', 'BB 코드', 'CB 코드', 'B 피치', 'C 피치', '톱날 두께'].map(header => (
                  <th key={header} style={{ border: '1px solid black', padding: '4px', backgroundColor: '#f0f0f0' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSystemCodeOptions.map((spec, index) => (
                <tr key={index} style={{ cursor: 'pointer' }} onClick={() => handleSystemCodeSelect(spec)} hover>
                  <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{spec.systemCode}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{spec.bbCode}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{spec.cbCode}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{spec.bWidth}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{spec.cWidth}</td>
                  <td style={{ border: '1px solid black', padding: '4px' }}>{spec.bladeThickness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Modal>
    </div>
  );
};

export default ItemDataGrid;