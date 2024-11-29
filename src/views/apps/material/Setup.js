import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, IconButton, Stack, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { useNavigate } from 'react-router-dom';

// Axios 설정: 헤더에 토큰 추가
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 토큰이 유효하지 않으면 로그인 페이지로 리다이렉트
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

const columnsLeft = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'materialCode', headerName: '자재코드', width: 150 },
  { field: 'materialType', headerName: '자재타입', width: 150 },
  { field: 'thickness', headerName: '자재길이 (mm)', width: 130 },
  { field: 'weight', headerName: '단중 (Kg/m)', width: 130 },
];

const columnsRight = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'systemCode', headerName: '사양 코드', width: 150 },
  { field: 'bbCode', headerName: 'BB코드', width: 150 },
  { field: 'cbCode', headerName: 'CB코드', width: 150 },
  { field: 'bWidth', headerName: 'B 피치 (mm)', width: 130 },
  { field: 'cWidth', headerName: 'C 피치 (mm)', width: 130 },
  { field: 'bladeThickness', headerName: '물량 두께 (mm)', width: 130 },
];

const Setup = () => {
  const [leftTableData, setLeftTableData] = useState([]);
  const [rightTableData, setRightTableData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState({});
  const [currentTable, setCurrentTable] = useState('left');
  const navigate = useNavigate();

  const fetchLeftTableData = async () => {
    try {
      const response = await axios.get('/api/item/material');
      setLeftTableData(response.data.table);
    } catch (error) {
      console.error('Error fetching left table data:', error);
    }
  };

  const fetchRightTableData = async () => {
    try {
      const response = await axios.get('/api/item/specific');
      setRightTableData(response.data.table);
    } catch (error) {
      console.error('Error fetching right table data:', error);
    }
  };

  const handleOpenModal = (table, row = {}) => {
    setCurrentTable(table);
    setCurrentRow(row);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentRow({});
  };

  const handleSave = async () => {
    try {
      if (currentRow.id) {
        // Update existing row
        await axios.put(
          currentTable === 'left' ? '/api/item/material' : '/api/item/specific',
          currentRow
        );
      } else {
        // Add new row
        await axios.post(
          currentTable === 'left' ? '/api/item/material' : '/api/item/specific',
          currentRow
        );
      }
      fetchLeftTableData();
      fetchRightTableData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving row:', error);
    }
  };

  const handleDelete = async (table, id) => {
    try {
      await axios.delete(
        `${table === 'left' ? '/api/item/material' : '/api/item/specific'}/${id}`
      );
      fetchLeftTableData();
      fetchRightTableData();
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setCurrentRow({ ...currentRow, [field]: value });
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchLeftTableData();
    fetchRightTableData();
  }, [navigate]);

  return (
    <div className="main">
      <PageContainer title="자재표준 셋업">
        <Grid container spacing={2}>
          {/* Left Table */}
          <Grid item lg={5} xs={12} mt={3}>
            <ParentCard title="자재개요 입력 화면">
              <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                <DataGrid
                  rows={leftTableData}
                  columns={columnsLeft}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  pagination
                  checkboxSelection
                  rowHeight={30}
                  onRowClick={(params) => handleOpenModal('left', params.row)}
                  sx={{
                    '& .MuiDataGrid-columnHeaders': {
                      height: 30,
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                    },
                  }}
                />
              </Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenModal('left')}
                  sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  color="warning"
                  onClick={() => handleDelete('left', currentRow.id)}
                  sx={{ border: '1px solid', borderColor: 'warning.main', borderRadius: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </ParentCard>
          </Grid>

          {/* Right Table */}
          <Grid item lg={7} xs={12} mt={3}>
            <ParentCard title="제작사양 입력 화면">
              <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                <DataGrid
                  rows={rightTableData}
                  columns={columnsRight}
                  pageSize={5}
                  checkboxSelection
                  rowsPerPageOptions={[5, 10, 20]}
                  pagination
                  rowHeight={30}
                  onRowClick={(params) => handleOpenModal('right', params.row)}
                  sx={{
                    '& .MuiDataGrid-columnHeaders': {
                      height: 30,
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                    },
                  }}
                />
              </Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenModal('right')}
                  sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  color="warning"
                  onClick={() => handleDelete('right', currentRow.id)}
                  sx={{ border: '1px solid', borderColor: 'warning.main', borderRadius: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>{currentRow.id ? 'Edit Row' : 'Add Row'}</DialogTitle>
        <DialogContent>
          {currentTable === 'left' ? (
            <>
              <TextField
                margin="dense"
                label="자재코드"
                fullWidth
                value={currentRow.materialCode || ''}
                onChange={(e) => handleInputChange('materialCode', e.target.value)}
              />
              <TextField
                margin="dense"
                label="자재타입"
                fullWidth
                value={currentRow.materialType || ''}
                onChange={(e) => handleInputChange('materialType', e.target.value)}
              />
              <TextField
                margin="dense"
                label="자재길이 (mm)"
                type="number"
                fullWidth
                value={currentRow.thickness || ''}
                onChange={(e) => handleInputChange('thickness', e.target.value)}
              />
              <TextField
                margin="dense"
                label="단중 (Kg/m)"
                type="number"
                fullWidth
                value={currentRow.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </>
          ) : (
            <>
              <TextField
                margin="dense"
                label="사양 코드"
                fullWidth
                value={currentRow.systemCode || ''}
                onChange={(e) => handleInputChange('systemCode', e.target.value)}
              />
              <TextField
                margin="dense"
                label="BB코드"
                fullWidth
                value={currentRow.bbCode || ''}
                onChange={(e) => handleInputChange('bbCode', e.target.value)}
              />
              <TextField
                margin="dense"
                label="CB코드"
                fullWidth
                value={currentRow.cbCode || ''}
                onChange={(e) => handleInputChange('cbCode', e.target.value)}
              />
              <TextField
                margin="dense"
                label="B 피치 (mm)"
                type="number"
                fullWidth
                value={currentRow.bWidth || ''}
                onChange={(e) => handleInputChange('bWidth', e.target.value)}
              />
              <TextField
                margin="dense"
                label="C 피치 (mm)"
                type="number"
                fullWidth
                value={currentRow.cWidth || ''}
                onChange={(e) => handleInputChange('cWidth', e.target.value)}
              />
              <TextField
                margin="dense"
                label="물량 두께 (mm)"
                type="number"
                fullWidth
                value={currentRow.bladeThickness || 5}
                onChange={(e) => handleInputChange('bladeThickness', e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
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

export default Setup;
