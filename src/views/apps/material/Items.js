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
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import SearchableSelect from '../../../components/shared/SearchableSelect';

const columns = [
  { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'itemName', headerName: '품명', flex: 1 },
  { field: 'systemCode', headerName: '사양코드', flex: 1 },
  { field: 'endBar', headerName: 'End-bar', flex: 1 },
  { field: 'itemType', headerName: '품목종류', flex: 1 },
  { field: 'width', headerName: '폭(mm)', flex: 1 },
  { field: 'length', headerName: '길이(mm)', flex: 1 },
  { field: 'cbCount', headerName: 'CB수', flex: 1 },
  { field: 'lep', headerName: 'LEP(mm)', flex: 1 },
  { field: 'rep', headerName: 'REP(mm)', flex: 1 },
  { field: 'weight', headerName: '중량(kg)', flex: 1 },
  { field: 'neWeight', headerName: 'NE중량(kg)', flex: 1 },
];
const itemTypeOptions = ['R', 'C', 'Angle 대', 'Angle 소', 'EndBar', 'GB', '각 Pipe', '특수 Type'];

const Items = () => {
  const [data, setData] = useState([]);
  const [specificCodes, setSpecificCodes] = useState([]);
  const [endBars, setEndBars] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState({});
  const [isEditing, setIsEditing] = useState(false);
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
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/item/standard');
      setData(response.data.table);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchSpecificCodes = async () => {
    try {
      const response = await axios.get('/api/item/specific');
      setSpecificCodes(response.data.table);
    } catch (error) {
      console.error('Error fetching specific codes:', error);
    }
  };

  const fetchEndBars = async () => {
    try {
      const response = await axios.get('/api/item/material');
      setEndBars(response.data.table);
    } catch (error) {
      console.error('Error fetching end bars:', error);
    }
  };

  const handleOpenModal = (row = {}) => {
    setCurrentRow(row);
    setIsEditing(!!row.id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentRow({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await axios.put(`/api/item/standard/${currentRow.id}`, currentRow);
      } else {
        await axios.post('/api/item/standard', currentRow);
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
        await axios.delete(`/api/item/standard/${currentRow.id}`);
        fetchData();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    const updatedRow = { ...currentRow, [field]: value };

    // 자동 계산 필드 (비활성화 상태)
    if (['width', 'length'].includes(field)) {
      // 향후 계산 로직 추가 예정
      updatedRow.cbCount = '';
      updatedRow.lep = '';
      updatedRow.rep = '';
      updatedRow.weight = '';
      updatedRow.neWeight = '';
    }

    setCurrentRow(updatedRow);
  };

  useEffect(() => {
    fetchData();
    fetchSpecificCodes();
    fetchEndBars();
  }, []);

  return (
    <div>
      <PageContainer title="규격품목 셋업">
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard title="규격품목 입력 화면">
              <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                <DataGrid
                  rows={data}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 30]}
                  pagination
                  columnHeaderHeight={30}
                  rowHeight={30}
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

      {/* Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? 'Edit Row' : 'Add Row'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="품명"
            fullWidth
            value={currentRow.itemName || ''}
            onChange={(e) => handleInputChange('itemName', e.target.value)}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <SearchableSelect
                label="사양코드 선택"
                options={specificCodes.map((row) => row.systemCode)}
                value={currentRow.systemCode || ''}
                onChange={(e) => handleInputChange('systemCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <SearchableSelect
                label="End-bar 선택"
                options={endBars.map((row) => row.materialCode)}
                value={currentRow.endBar || ''}
                onChange={(e) => handleInputChange('endBar', e.target.value)}
              />
            </Grid>
          </Grid>
          <br />
          <Select
            margin="dense"
            fullWidth
            value={currentRow.itemType || ''}
            onChange={(e) => handleInputChange('itemType', e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              품목종류 선택
            </MenuItem>
            {itemTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="폭(mm)"
                type="number"
                fullWidth
                value={currentRow.width || ''}
                onChange={(e) => handleInputChange('width', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="길이(mm)"
                type="number"
                fullWidth
                value={currentRow.length || ''}
                onChange={(e) => handleInputChange('length', e.target.value)}
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            label="CB수"
            type="number"
            fullWidth
            value={currentRow.cbCount || ''}
            disabled
          />
          <TextField
            margin="dense"
            label="LEP(mm)"
            type="number"
            fullWidth
            value={currentRow.lep || ''}
            disabled
          />
          <TextField
            margin="dense"
            label="REP(mm)"
            type="number"
            fullWidth
            value={currentRow.rep || ''}
            disabled
          />
          <TextField
            margin="dense"
            label="중량(kg)"
            type="number"
            fullWidth
            value={currentRow.weight || ''}
            disabled
          />
          <TextField
            margin="dense"
            label="NE중량(kg)"
            type="number"
            fullWidth
            value={currentRow.neWeight || ''}
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

export default Items;
