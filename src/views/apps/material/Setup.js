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
import { useNavigate } from 'react-router-dom';

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
    if (error.response && error.response.status === 401) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

const columnsLeft = [
  // { field: 'id', headerName: 'ID', width: 70 },
  { field: 'materialCode', headerName: '자재코드', flex: 1 },
  { field: 'materialType', headerName: '자재타입', flex: 1 },
  { field: 'thickness', headerName: '자재길이 (mm)', flex: 1 },
  { field: 'weight', headerName: '단중 (Kg/m)', flex: 1 },
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

  const generateMaterialCode = (materialType, materialLength) => {
    if (!materialType || !materialLength) return ''; // 빈 값 처리

    const type = materialType.trim();
    const length = materialLength.toString().trim();
    const code = type.split('*');

    // 첫 번째 부분 처리
    const letters = code[0].match(/[A-Za-z]+/g)?.join('') || ''; // 알파벳 추출
    const numberPart = code[0].match(/[0-9]+/g)?.join('') || '0'; // 숫자만 추출
    const paddedFirst = `${letters}${numberPart.padStart(3, '0')}`; // 정수부만 3자리 패딩

    // 두 번째 부분 처리
    let paddedSecond = '';
    if (code[1]) {
      const [integerPart, decimalPart] = code[1].split('.'); // 정수부와 소수부 분리
      const leftPadded = (integerPart || '0').padStart(3, '0'); // 정수부 왼쪽 3자리 패딩
      const rightPadded = decimalPart || (code[2] ? '0' : ''); // 오른쪽 패딩은 소수부가 없으면 '0'
      paddedSecond = code[2]
        ? `${leftPadded}${rightPadded.padEnd(1, '0')}` // 오른쪽 1자리 패딩
        : `${leftPadded}${rightPadded}`; // 소수부만 붙임
    }

    // 세 번째 부분 처리
    let paddedThird = '';
    if (code[2]) {
      paddedThird = code[2].padEnd(2, '0'); // 세 번째 부분 2자리 오른쪽 패딩
    }

    // 결과 조합
    return `${paddedFirst}${paddedSecond}${paddedThird}-${length}`;
  };
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
    setTimeout(() => {
      setCurrentRow({}); // 모달 닫힌 후 상태 초기화
    }, 300);
  };

  const handleSave = async () => {
    try {
      if (currentRow.id) {
        await axios.put(
          `/api/item/${currentTable === 'left' ? 'material' : 'specific'}/${currentRow.id}`,
          currentRow,
        );
      } else {
        await axios.post(
          `/api/item/${currentTable === 'left' ? 'material' : 'specific'}`,
          currentRow,
        );
      }
      fetchLeftTableData();
      fetchRightTableData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving row:', error);
    }
  };

  const handleInputChange = (field, value) => {
    const updatedRow = { ...currentRow, [field]: value };

    if (field === 'materialType' || field === 'thickness') {
      const generatedCode = generateMaterialCode(
        updatedRow.materialType || '',
        updatedRow.thickness || '',
      );
      updatedRow.materialCode = generatedCode; // 자재코드 자동 생성
    }

    setCurrentRow(updatedRow);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
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
          <Grid item lg={5} xs={12} mt={3}>
            <ParentCard title="자재개요 입력 화면">
              <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                <DataGrid
                  rows={leftTableData}
                  columns={columnsLeft}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  pagination
                  rowHeight={30}
                  onRowClick={(params) => handleOpenModal('left', params.row)}
                  sx={{
                    '& .MuiDataGrid-columnHeaders': {
                      height: 60,
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                    },
                  }}
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" alignItems="center" mt={2}>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenModal('left')}
                  sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
            </ParentCard>
          </Grid>

          <Grid item lg={7} xs={12} mt={3}>
            <ParentCard title="제작사양 입력 화면">
              <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                <DataGrid
                  rows={rightTableData}
                  columns={columnsRight}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  pagination
                  rowHeight={30}
                  onRowClick={(params) => handleOpenModal('right', params.row)}
                  sx={{
                    '& .MuiDataGrid-columnHeaders': {
                      height: 60,
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                    },
                  }}
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" alignItems="center" mt={2}>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenModal('right')}
                  sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>

      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>{currentRow.id ? '편집' : '추가'}</DialogTitle>
        <DialogContent>
          {currentTable === 'left' ? (
            <>
              <TextField
                margin="dense"
                label="자재코드"
                fullWidth
                disabled
                value={currentRow.materialCode || ''}
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
                value={currentRow.bladeThickness || ''}
                onChange={(e) => handleInputChange('bladeThickness', e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {currentRow.id && (
            <Button
              onClick={async () => {
                try {
                  await axios.delete(
                    `/api/item/${currentTable === 'left' ? 'material' : 'specific'}/${
                      currentRow.id
                    }`,
                  );
                  currentTable === 'left' ? fetchLeftTableData() : fetchRightTableData();
                  handleCloseModal();
                  alert('삭제되었습니다.');
                } catch (error) {
                  console.error('Error deleting row:', error);
                  alert('삭제 중 오류가 발생했습니다.');
                }
              }}
              color="warning"
            >
              삭제
            </Button>
          )}
          <Button onClick={handleSave} color="primary">
            {currentRow.id ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Setup;
