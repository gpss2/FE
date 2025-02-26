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
import SearchableSelect from '../../../components/shared/SearchableSelect';

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
  { field: 'materialCode', headerName: '자재코드', flex: 1 },
  { field: 'materialType', headerName: '자재타입', flex: 1 },
  { field: 'length', headerName: '자재길이 (mm)', flex: 1 },
  { field: 'weight', headerName: '단중 (Kg/m)', flex: 1 },
];

const columnsRight = [
  { field: 'systemCode', headerName: '사양 코드', flex: 1 },
  { field: 'bbCode', headerName: 'BB코드', flex: 1 },
  { field: 'cbCode', headerName: 'CB코드', flex: 1 },
  { field: 'bWidth', headerName: 'B 피치 (mm)', flex: 1 },
  { field: 'cWidth', headerName: 'C 피치 (mm)', flex: 1 },
  { field: 'bladeThickness', headerName: '톱날 두께 (mm)', flex: 1 },
];

const Setup = () => {
  const [leftTableData, setLeftTableData] = useState([]);
  const [rightTableData, setRightTableData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState({});
  const [currentTable, setCurrentTable] = useState('left');
  const navigate = useNavigate();

  const generateMaterialCode = (materialType, thickness) => {
    const fullType = materialType.split('*');

    const mType = (fullType[0]?.match(/[a-zA-Z]+/g) || ['']).join(''); // 자재타입을 분류
    const size = fullType[0].replace(mType, '').replace('.', '').padStart(3, '0'); // 길이 분리, 기본값 '0'

    let materialCode = mType + size;

    if (fullType.length > 2) {
      let w_OUT = (fullType[1] || '0').padStart(4, '0').replace('.', ''); // OUT 너비
      let w_IN = ((fullType[2] || '0').split('.')[0] || '0').padEnd(2, '0'); // IN 너비
      materialCode = materialCode + w_OUT + w_IN + '-' + thickness;
    } else if (fullType.length > 1) {
      let w_Integer = ((fullType[1] || '0').split('.')[0] || '0').padStart(3, '0'); // 너비 정수 부분
      let w_Float = fullType[1]?.split('.')[1] || '0'; // 소수 부분, 없으면 '0'
      materialCode = materialCode + w_Integer + w_Float + '-' + thickness;
    }

    return materialCode;
  };

  const generateSystemCode = (bbCode, cbCode, bWidth, cWidth, bladeThickness) => {
    if (!bbCode) return '';
    const filteredRows = rightTableData.filter(
      (row) =>
        row.bbCode === bbCode &&
        (row.cbCode !== cbCode ||
          row.bWidth !== bWidth ||
          row.cWidth !== cWidth ||
          row.bladeThickness !== bladeThickness),
    );

    const nextSerialNumber = (filteredRows.length + 1).toString().padStart(3, '0');
    return `MS-${bbCode.split('-')[0]}-${nextSerialNumber}`;
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
    // 오른쪽 테이블(제작사양 입력)에서 새 행 추가 시 기본값 적용
    if (table === 'right' && Object.keys(row).length === 0) {
      row = { ...row, bWidth: 30.0, cWidth: 100, bladeThickness: 9 };
    }
    setCurrentTable(table);
    setCurrentRow(row);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setCurrentRow({});
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

    if (currentTable === 'left') {
      if (field === 'materialType' || field === 'length') {
        updatedRow.materialCode = generateMaterialCode(
          updatedRow.materialType || '',
          updatedRow.length || '',
        );
      }
    } else {
      if (
        field === 'bbCode' ||
        field === 'cbCode' ||
        field === 'bWidth' ||
        field === 'cWidth' ||
        field === 'bladeThickness'
      ) {
        updatedRow.systemCode = generateSystemCode(
          updatedRow.bbCode || '',
          updatedRow.cbCode || '',
          updatedRow.bWidth || '',
          updatedRow.cWidth || '',
          updatedRow.bladeThickness || '',
        );
      }
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
                  columnHeaderHeight={30}
                  rowHeight={30}
                  rows={leftTableData}
                  columns={columnsLeft}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  pagination
                  onRowClick={(params) => handleOpenModal('left', params.row)}
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" alignItems="center" mt={2}>
                <IconButton
                  color="primary"
                  sx={{
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                  }}
                  onClick={() => handleOpenModal('left')}
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
                  columnHeaderHeight={30}
                  rowHeight={30}
                  onRowClick={(params) => handleOpenModal('right', params.row)}
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" alignItems="center" mt={2}>
                <IconButton
                  color="primary"
                  sx={{
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                  }}
                  onClick={() => handleOpenModal('right')}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>

      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
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
                value={currentRow.length || ''}
                onChange={(e) => handleInputChange('length', e.target.value)}
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
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <SearchableSelect
                    label="BB 코드 선택"
                    options={leftTableData.map((row) => row.materialCode)}
                    value={currentRow.bbCode || ''}
                    onChange={(e) => handleInputChange('bbCode', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <SearchableSelect
                    label="CB 코드 선택"
                    options={leftTableData.map((row) => row.materialCode)}
                    value={currentRow.cbCode || ''}
                    onChange={(e) => handleInputChange('cbCode', e.target.value)}
                  />
                </Grid>
              </Grid>
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
                label="톱날 두께 (mm)"
                type="number"
                fullWidth
                value={currentRow.bladeThickness || ''}
                onChange={(e) => handleInputChange('bladeThickness', e.target.value)}
              />
              <TextField
                margin="dense"
                label="사양 코드"
                fullWidth
                disabled
                value={currentRow.systemCode || ''}
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
