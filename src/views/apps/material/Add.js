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
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import SearchableSelect from '../../../components/shared/SearchableSelect';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'materialCode', headerName: '자재코드', flex: 1 },
  { field: 'pcs', headerName: '입고수량 (PCS)', flex: 1 },
  { field: 'kg', headerName: '입고중량 (Kg)', flex: 1 },
];

const Add = () => {
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

  const handleInputChange = (field, value) => {
    setCurrentRow({ ...currentRow, [field]: value });
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
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Edit Row' : 'Add Row'}</DialogTitle>
        <DialogContent>
          <SearchableSelect
            label="자재코드 선택"
            options={materialCodes.map((row) => row.materialCode)}
            value={currentRow.materialCode || ''}
            onChange={(e) => handleInputChange('materialCode', e.target.value)}
          />

          <TextField
            margin="dense"
            label="입고수량 (PCS)"
            type="number"
            fullWidth
            value={currentRow.pcs || ''}
            onChange={(e) => handleInputChange('pcs', e.target.value)}
          />
          <TextField
            margin="dense"
            label="입고중량 (Kg)"
            type="number"
            fullWidth
            value={currentRow.kg || ''}
            onChange={(e) => handleInputChange('kg', e.target.value)}
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
