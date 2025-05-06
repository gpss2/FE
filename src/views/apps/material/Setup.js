import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from '../../../components/shared/SearchableSelect';
import { width } from '@mui/system';

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
const indexColumn = {
  field: 'index',
  headerName: '',
  width: 20,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  cellClassName: 'index-cell',
  renderCell: (params) => {
    const sortedRowIds = params.api.getSortedRowIds();
    return sortedRowIds.indexOf(params.id) + 1;
  },
};
const columnsLeft = [
  indexColumn,
  { field: 'materialCode', headerName: '자재코드', flex: 1 },
  { field: 'materialType', headerName: '자재타입', flex: 1 },
  { field: 'length', headerName: '자재길이 (mm)', flex: 1 },
  { field: 'weight', headerName: '단중 (Kg/m)', flex: 1 },
];

const columnsRight = [
  indexColumn,
  { field: 'systemCode', headerName: '사양 코드', flex: 1 },
  { field: 'bbCode', headerName: 'BB코드', flex: 1 },
  { field: 'cbCode', headerName: 'CB코드', flex: 1 },
  { field: 'bWidth', headerName: 'B 피치 (mm)', width: 80 },
  { field: 'cWidth', headerName: 'C 피치 (mm)', width: 80 },
  { field: 'bladeThickness', headerName: '톱날 두께 (mm)', width: 80 },
];

const Setup = () => {
  const [leftTableData, setLeftTableData] = useState([]);
  const [rightTableData, setRightTableData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState({});
  const [currentTable, setCurrentTable] = useState('left');
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const navigate = useNavigate();

  const inputRefs = useRef([]);
  const materialTypeRef = useRef(null); // 자재타입 필드를 참조하기 위한 ref

  const generateMaterialCode = (materialType, thickness) => {
    const fullType = materialType.split('*');

    const mType = (fullType[0]?.match(/[a-zA-Z]+/g) || ['']).join(''); // 자재타입을 분류
    const size = fullType[0].replace(mType, '').split('.')[0].padStart(3, '0');
    let materialCode = mType + size;

    if (fullType.length > 2) {
      let w_OUT =
        (fullType[1] || '0').split('.')[0].padStart(3, '0') +
        ((fullType[1] || '0').split('.')[1] || '0');
      let w_IN = (fullType[2] || '0').replace('.', '').padEnd(2, '0'); // IN 너비
      materialCode = materialCode + w_OUT + w_IN + '-' + thickness;
    } else if (fullType.length > 1) {
      let w_Integer = ((fullType[1] || '0').split('.')[0] || '0').padStart(3, '0'); // 너비 정수 부분
      let w_Float = fullType[1]?.split('.')[1] || '0'; // 소수 부분, 없으면 '0'
      materialCode = materialCode + w_Integer + w_Float + '-' + thickness;
    }

    return materialCode;
  };

  const generateSystemCode = (bbCode) => {
    if (!bbCode) return '';

    // 1) 하이픈 앞 접두사
    const prefix = bbCode.split('-')[0];

    // 2) 정규식으로 기존 systemCode 중 같은 prefix 그룹만 추출
    const pattern = new RegExp(`^MS-${prefix}-(\\d{3})$`);
    const existingNums = rightTableData.reduce((acc, row) => {
      const m = row.systemCode.match(pattern);
      if (m) acc.push(parseInt(m[1], 10));
      return acc;
    }, []);

    // 3) max+1 계산 (없으면 1)
    const next = existingNums.length ? Math.max(...existingNums) + 1 : 1;

    // 4) 3자리로 포맷팅
    const nextSerial = String(next).padStart(3, '0');
    return `MS-${prefix}-${nextSerial}`;
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
    setIsLoading(true); // 로딩 시작
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
      if (error.response && error.response.status === 400 && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        console.error('Error saving row:', error);
      }
    } finally {
      setIsLoading(false); // 로딩 끝
    }
  };

  const handleInputChange = (field, value) => {
    // 입력값을 대문자로 변환하고 'x'는 '*'로 변환
    let updatedValue = value.toUpperCase().replace(/X/g, '*');

    const updatedRow = { ...currentRow, [field]: updatedValue };

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

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      if (index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      } else {
        handleSave();
      }
    }
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

  // 모달이 열릴 때 자재타입 필드에 포커스를 맞추기 위한 useEffect
  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => {
        if (materialTypeRef.current) {
          materialTypeRef.current.focus();
        }
      }, 100); // 포커스를 100ms 지연 후 설정
    }
  }, [modalOpen]);

  return (
    <div className="main">
      <PageContainer title="자재표준 셋업">
        <Grid container spacing={2}>
          <Grid item lg={5} xs={12} mt={3}>
            <ParentCard title="자재개요 입력 화면">
              <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                <DataGrid
                  columnHeaderHeight={40}
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
                  columnHeaderHeight={40}
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
                onKeyDown={(e) => handleKeyDown(e, 0)}
                inputRef={materialTypeRef} // 자재타입 필드에 포커스
              />
              <TextField
                margin="dense"
                label="자재길이 (mm)"
                type="number"
                fullWidth
                value={currentRow.length || ''}
                onChange={(e) => handleInputChange('length', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 1)}
                inputRef={(el) => (inputRefs.current[1] = el)}
              />
              <TextField
                margin="dense"
                label="단중 (Kg/m)"
                type="number"
                fullWidth
                value={currentRow.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                inputRef={(el) => (inputRefs.current[2] = el)}
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
                    onKeyDown={(e) => handleKeyDown(e, 0)}
                    inputRef={(el) => (inputRefs.current[0] = el)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <SearchableSelect
                    label="CB 코드 선택"
                    options={leftTableData
                      .map((row) => row.materialCode)
                      .filter((code) => /^SQ|RQ|PI/.test(code))}
                    value={currentRow.cbCode || ''}
                    onChange={(e) => handleInputChange('cbCode', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 1)}
                    inputRef={(el) => (inputRefs.current[1] = el)}
                    required
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
                onKeyDown={(e) => handleKeyDown(e, 2)}
                inputRef={(el) => (inputRefs.current[2] = el)}
              />
              <TextField
                margin="dense"
                label="C 피치 (mm)"
                type="number"
                fullWidth
                value={currentRow.cWidth || ''}
                onChange={(e) => handleInputChange('cWidth', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 3)}
                inputRef={(el) => (inputRefs.current[3] = el)}
              />
              <TextField
                margin="dense"
                label="톱날 두께 (mm)"
                type="number"
                fullWidth
                value={currentRow.bladeThickness || ''}
                onChange={(e) => handleInputChange('bladeThickness', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 4)}
                inputRef={(el) => (inputRefs.current[4] = el)}
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
                  if (
                    error.response &&
                    error.response.status === 400 &&
                    error.response.data.detail
                  ) {
                    alert(error.response.data.detail);
                  } else {
                    console.error('Error deleting row:', error);
                    alert('삭제 중 오류가 발생했습니다.');
                  }
                }
              }}
              color="warning"
            >
              삭제
            </Button>
          )}
          <Button
            onClick={handleSave}
            color="primary"
            disabled={isLoading} // 로딩 중 버튼 비활성화
          >
            {isLoading ? <CircularProgress size={24} /> : currentRow.id ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Setup;
