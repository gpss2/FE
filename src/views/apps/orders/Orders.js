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
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';

const columns = [
  { field: 'taskNumber', headerName: '태스크번호', flex: 1 },
  { field: 'orderNumber', headerName: '수주번호', flex: 1 },
  { field: 'surfaceTreatment', headerName: '표면처리', flex: 1 },
  { field: 'coatingThickness', headerName: '도금 두께', flex: 1 },
  { field: 'remarks', headerName: '특기사항', flex: 1 },
  { field: 'category', headerName: '구분', flex: 1 },
  { field: 'orderDate', headerName: '수주일자', flex: 1 },
  { field: 'customerCode', headerName: '수주처', flex: 1 },
  { field: 'deliveryDate', headerName: '납기일자', flex: 1 },
];

const Orders = () => {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [dailyTaskCount, setDailyTaskCount] = useState(0);

  // 데이터 로드
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/order/list');
      setData(response.data.table);
      updateDailyTaskCount(response.data.table);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // 오늘 날짜의 테스크 번호 생성
  const generateTaskNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const nextTaskNumber = dailyTaskCount + 1;
    return `${year}${month}${day}-T-${String(nextTaskNumber).padStart(2, '0')}`;
  };

  // 오늘 날짜 기준 테스크 번호 카운트 갱신
  const updateDailyTaskCount = (rows) => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = rows.filter((row) => row.orderDate.startsWith(today));
    setDailyTaskCount(todayTasks.length);
  };

  const handleOpenModal = (row = {}) => {
    if (!row.id) {
      // 새 수주일 경우 자동으로 테스크 번호 생성
      row.taskNumber = generateTaskNumber();
    }
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
        await axios.put(`/api/order/list/${currentRow.id}`, currentRow);
      } else {
        await axios.post('/api/order/list', currentRow);
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
        await axios.delete(`/api/order/list/${currentRow.id}`);
        fetchData();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setCurrentRow((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <PageContainer title="수주 목록 입력">
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard title="수주 목록 관리">
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
        <DialogTitle>{isEditing ? 'Edit Order' : 'Add Order'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="태스크번호"
            fullWidth
            value={currentRow.taskNumber || ''}
            disabled // 테스크 번호는 자동 생성
          />
          <TextField
            margin="dense"
            label="수주번호"
            fullWidth
            value={currentRow.orderNumber || ''}
            onChange={(e) => handleInputChange('orderNumber', e.target.value)}
          />
          <TextField
            margin="dense"
            label="표면처리"
            fullWidth
            value={currentRow.surfaceTreatment || ''}
            onChange={(e) => handleInputChange('surfaceTreatment', e.target.value)}
          />
          <TextField
            margin="dense"
            label="도금 두께"
            type="number"
            fullWidth
            value={currentRow.coatingThickness || ''}
            onChange={(e) => handleInputChange('coatingThickness', parseFloat(e.target.value))}
          />
          <TextField
            margin="dense"
            label="특이사항"
            fullWidth
            value={currentRow.remarks || ''}
            onChange={(e) => handleInputChange('remarks', e.target.value)}
          />
          <TextField
            margin="dense"
            label="구분"
            fullWidth
            value={currentRow.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="수주일자"
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                value={currentRow.orderDate || ''}
                onChange={(e) => handleInputChange('orderDate', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="납기일자"
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                value={currentRow.deliveryDate || ''}
                onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            label="수주처"
            fullWidth
            value={currentRow.customerCode || ''}
            onChange={(e) => handleInputChange('customerCode', e.target.value)}
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

export default Orders;
