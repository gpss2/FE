import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Grid,
  IconButton,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import SearchableSelect from '../../../components/shared/SearchableSelect';
import MyDataGrid from './MyDataGrid';

// Helper for number formatting
const formatNumber = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
};

// Helper for formatting with one decimal place
const formatNumberWithOneDecimal = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0.0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};


const Add = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 403) {
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    },
  );
  
  // Columns definition with valueFormatter for number formatting
  const columns = [
    {
      field: 'index',
      headerName: '',
      width: 40,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      cellClassName: 'index-cell',
      renderCell: (params) => {
        const sortedRowIds = params.api.getSortedRowIds();
        return sortedRowIds.indexOf(params.id) + 1;
      },
    },
    { field: 'materialCode', headerName: '자재코드', flex: 1 },
    {
      field: 'kg',
      headerName: '입고중량 (Kg)',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) => formatNumber(value),
    },
    {
      field: 'pcs',
      headerName: '투입중량 (Kg)',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) => formatNumber(value),
    },
    {
      field: 'stock',
      headerName: '재고중량 (Kg)',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        if (!params.row) return '0.0';
        const kg = parseFloat(params.row.kg) || 0;
        const pcs = parseFloat(params.row.pcs) || 0;
        return formatNumberWithOneDecimal(kg - pcs);
      },
    },
  ];


  const [data, setData] = useState([]);
  const [materialCodes, setMaterialCodes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/item/store');
      setData(response.data.table);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchMaterialCodes = async () => {
    try {
      const response = await axios.get('/api/item/material');
      setMaterialCodes(response.data.table);
    } catch (error) {
      console.error('Error fetching material codes:', error);
    }
  };

  const handleOpenModal = (row = {}) => {
    setCurrentRow(row);
    setIsEditing(!!row.id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setTimeout(() => {
      setCurrentRow({});
    }, 300);
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await axios.put(`/api/item/store/${currentRow.id}`, currentRow);
      } else {
        await axios.post('/api/item/store', currentRow);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (currentRow.id) {
        await axios.delete(`/api/item/store/${currentRow.id}`);
        fetchData();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };
  
  // Handles changes from numeric text fields
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Remove commas to store raw number, and allow only numeric input
    const rawValue = value.replace(/,/g, '');
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
      setCurrentRow({ ...currentRow, [name]: rawValue });
    }
  };
  
  // Handles changes from the searchable select
  const handleSelectChange = (value) => {
      setCurrentRow({ ...currentRow, materialCode: value });
  };


  useEffect(() => {
    fetchData();
    fetchMaterialCodes();
  }, []);

  return (
    <div>
      <PageContainer title="자재입고 등록">
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard title="자재정보 입력 화면">
              <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                <MyDataGrid
                  rows={data}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 30]}
                  pagination
                  columnHeaderHeight={40}
                  rowHeight={25}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      border: '1px solid black',
                      fontSize: '12px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '14px',
                      backgroundColor: '#B2B2B2',
                      border: '1px solid black',
                    },
                    '& .MuiDataGrid-columnHeaderTitleContainer': {
                        justifyContent: 'center',
                    },
                    '& .MuiDataGrid-footerContainer': { display: '' },
                    '& .index-cell': { backgroundColor: '#B2B2B2' },
                  }}
                  onRowClick={(params) => handleOpenModal(params.row)}
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" alignItems="center" mt={2}>
                <IconButton
                  color="primary"
                  aria-label="add"
                  onClick={() => handleOpenModal()}
                  sx={{
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>

      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? '자재 정보 수정' : '신규 자재 입고'}</DialogTitle>
        <DialogContent>
          <SearchableSelect
            label="자재코드 선택"
            options={materialCodes.map((row) => row.materialCode)}
            value={currentRow.materialCode || ''}
            onChange={(e) => handleSelectChange(e.target.value)}
          />
          <TextField
            margin="dense"
            label="입고중량 (Kg)"
            type="text" // Use text type to show commas
            fullWidth
            name="kg"
            value={formatNumber(currentRow.kg)}
            onChange={handleNumberChange}
          />
          <TextField
            margin="dense"
            label="투입중량 (Kg)"
            type="text" // Use text type to show commas
            fullWidth
            name="pcs"
            value={formatNumber(currentRow.pcs)}
            onChange={handleNumberChange}
          />
          <TextField
            margin="dense"
            label="재고중량 (Kg)"
            type="text"
            fullWidth
            value={formatNumberWithOneDecimal((parseFloat(currentRow.kg) || 0) - (parseFloat(currentRow.pcs) || 0))}
            InputProps={{ readOnly: true }}
            disabled
          />
        </DialogContent>
        <DialogActions>
          {isEditing && (
            <Button onClick={handleDelete} color="warning">
              삭제
            </Button>
          )}
          <Button onClick={handleCloseModal} color="secondary">
            취소
          </Button>
          <Button onClick={handleSave} color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Add;