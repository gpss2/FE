import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Grid,
  Stack,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { useNavigate } from 'react-router-dom';
import MyDataGrid from '../material/MyDataGrid';

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
const indexColumn = {
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
};
const columns = [
  indexColumn,
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
  const navigate = useNavigate();
  // 모달 입력 필드들을 관리할 ref 배열
  const inputRefs = useRef([]);

  // 데이터 로드
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/order/list');
      const processedData = response.data.table.map((row) => ({
        ...row,
        orderDate: row.orderDate.split('T')[0],
        deliveryDate: row.deliveryDate.split('T')[0],
      }));
      setData(processedData);
      updateDailyTaskCount(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // 오늘 날짜 기준 태스크 번호 카운트 업데이트
  const updateDailyTaskCount = (rows) => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = rows.filter((row) => row.orderDate.startsWith(today));
    setDailyTaskCount(todayTasks.length);
  };

  // 오늘 날짜의 태스크 번호 생성
  const generateTaskNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const nextTaskNumber = dailyTaskCount + 1;
    return `${year}${month}${day}-T-${String(nextTaskNumber).padStart(2, '0')}`;
  };

  const handleOpenModal = (row = {}) => {
    if (!row.id) {
      // 새 수주일 경우 자동으로 태스크 번호 생성 및 기본값 설정
      row.taskNumber = generateTaskNumber();
      row.surfaceTreatment = 'GALV';
      row.coatingThickness = 75.0;
      row.remarks = '없음';
      row.category = '플랜트';
    }
    setCurrentRow(row);
    setIsEditing(!!row.id);
    setModalOpen(true);
    // 모달 열릴 때 첫번째 입력 필드(태스크번호는 비활성화이므로 수주번호 필드에 포커스)
    setTimeout(() => {
      if (inputRefs.current[1]) {
        inputRefs.current[1].focus();
      }
    }, 100);
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

  // 엔터키 이벤트: Enter 누르면 다음 입력 필드로 포커스, 마지막(수주처)에서 Enter 누르면 저장
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      } else {
        handleSave();
      }
    }
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
                <MyDataGrid
                  rows={data}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 30]}
                  pagination
                  columnHeaderHeight={30}
                  rowHeight={25}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      border: '1px solid black',
                      fontSize: '12px',
                      paddingTop: '2px', // 위쪽 패딩 조정
                      paddingBottom: '2px', // 아래쪽 패딩 조정
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '14px',
                      backgroundColor: '#B2B2B2',
                      border: '1px solid black',
                    },
                    '& .group0': { backgroundColor: '#ffffff' },
                    '& .group1': { backgroundColor: '#f5f5f5' },
                    '& .error-cell': { backgroundColor: 'red', color: 'white' },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      whiteSpace: 'pre-wrap',
                      textAlign: 'center',
                      lineHeight: '1.2',
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

      {/* Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? 'Edit Order' : 'Add Order'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="태스크번호"
            fullWidth
            value={currentRow.taskNumber || ''}
            disabled
            onKeyDown={(e) => handleKeyDown(e, 0)}
            inputRef={(el) => (inputRefs.current[0] = el)}
          />
          <TextField
            margin="dense"
            label="수주번호"
            fullWidth
            value={currentRow.orderNumber || ''}
            onChange={(e) => handleInputChange('orderNumber', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            inputRef={(el) => (inputRefs.current[1] = el)}
          />
          <TextField
            margin="dense"
            label="표면처리"
            fullWidth
            value={currentRow.surfaceTreatment || ''}
            onChange={(e) => handleInputChange('surfaceTreatment', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 2)}
            inputRef={(el) => (inputRefs.current[2] = el)}
          />
          <TextField
            margin="dense"
            label="도금 두께"
            type="number"
            fullWidth
            value={currentRow.coatingThickness || ''}
            onChange={(e) => handleInputChange('coatingThickness', parseFloat(e.target.value))}
            onKeyDown={(e) => handleKeyDown(e, 3)}
            inputRef={(el) => (inputRefs.current[3] = el)}
          />
          <TextField
            margin="dense"
            label="특이사항"
            fullWidth
            value={currentRow.remarks || ''}
            onChange={(e) => handleInputChange('remarks', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 4)}
            inputRef={(el) => (inputRefs.current[4] = el)}
          />
          <TextField
            margin="dense"
            label="구분"
            fullWidth
            value={currentRow.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 5)}
            inputRef={(el) => (inputRefs.current[5] = el)}
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
                onKeyDown={(e) => handleKeyDown(e, 6)}
                inputRef={(el) => (inputRefs.current[6] = el)}
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
                onKeyDown={(e) => handleKeyDown(e, 7)}
                inputRef={(el) => (inputRefs.current[7] = el)}
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            label="수주처"
            fullWidth
            value={currentRow.customerCode || ''}
            onChange={(e) => handleInputChange('customerCode', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 8)}
            inputRef={(el) => (inputRefs.current[8] = el)}
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
