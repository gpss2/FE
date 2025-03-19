import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Grid,
  Stack,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from '../../../components/shared/SearchableSelect';

// axios 인터셉터 설정
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

// 인덱스 컬럼 (행 번호를 1부터 표시)
const indexColumn = {
  field: 'index',
  headerName: '',
  width: 50,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  cellClassName: 'index-cell',
  renderCell: (params) => {
    const sortedRowIds = params.api.getSortedRowIds();
    return sortedRowIds.indexOf(params.id) + 1;
  },
};

// Items용 그리드 컬럼 정의
const columns = [
  indexColumn,
  { field: 'itemName', headerName: '품명', flex: 1, editable: true },
  { field: 'systemCode', headerName: '사양코드', flex: 1, editable: true },
  { field: 'endBar', headerName: 'End-bar', flex: 1, editable: true },
  { field: 'itemType', headerName: '품목종류', flex: 1, editable: true },
  { field: 'width', headerName: '폭(mm)', flex: 1, editable: true },
  { field: 'length', headerName: '길이(mm)', flex: 1, editable: true },
  { field: 'cbCount', headerName: 'CB수', flex: 1, editable: true },
  { field: 'lep', headerName: 'LEP(mm)', flex: 1, editable: true },
  { field: 'rep', headerName: 'REP(mm)', flex: 1, editable: true },
  { field: 'weight', headerName: '중량(kg)', flex: 1, editable: true },
  { field: 'neWeight', headerName: 'NE중량(kg)', flex: 1, editable: true },
];

// 품목종류 선택 옵션
const itemTypeOptions = ['R', 'C', 'Angle 대', 'Angle 소', 'EndBar', 'GB', '각 Pipe', '특수 Type'];

// 폭, 길이, 사양코드 변경 시 자동으로 CB수, LEP, REP를 계산하는 함수
const calculateValues = (row, specificCodes) => {
  const length = Number(row.length) || 0;
  const spec = specificCodes.find((item) => item.systemCode === row.systemCode);
  const C_PITCH = spec ? Number(spec.cWidth) : 100; // 사양코드에 해당하는 cWidth, 없으면 기본 100
  let cbCount = Math.floor(length / C_PITCH) + 1;
  let total = length - (cbCount - 1) * C_PITCH;
  let lep = total / 2;
  let rep = total / 2;
  // LEP나 REP가 40 미만이면 CB수를 줄여 재계산
  while ((lep < 40 || rep < 40) && cbCount > 1) {
    cbCount--;
    total = length - (cbCount - 1) * C_PITCH;
    lep = total / 2;
    rep = total / 2;
  }
  return {
    cbCount,
    lep: Number(lep.toFixed(2)),
    rep: Number(rep.toFixed(2)),
  };
};

const Items = () => {
  const [data, setData] = useState([]); // 규격품목 데이터
  const [specificCodes, setSpecificCodes] = useState([]); // 사양코드 데이터
  const [endBars, setEndBars] = useState([]); // End-bar 데이터
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [applyLoading, setApplyLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const navigate = useNavigate();

  // 모달 관련 상태 (사양코드, End-bar, 품목종류 선택용)
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchData();
    fetchSpecificCodes();
    fetchEndBars();
  }, [navigate]);

  // API 호출: 규격품목 데이터
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/item/standard');
      setData(response.data.table);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // API 호출: 사양코드 데이터
  const fetchSpecificCodes = async () => {
    try {
      const response = await axios.get('/api/item/specific');
      setSpecificCodes(response.data.table);
    } catch (error) {
      console.error('Error fetching specific codes:', error);
    }
  };

  // API 호출: End-bar 데이터
  const fetchEndBars = async () => {
    try {
      const response = await axios.get('/api/item/material');
      setEndBars(response.data.table);
    } catch (error) {
      console.error('Error fetching end bars:', error);
    }
  };

  // 인라인 편집으로 행 업데이트 시 처리 (폭, 길이, 사양코드 변경 시 자동 계산)
  const handleProcessRowUpdate = (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;
    if (
      newRow.width !== oldRow.width ||
      newRow.length !== oldRow.length ||
      newRow.systemCode !== oldRow.systemCode
    ) {
      const calc = calculateValues(newRow, specificCodes);
      newRow.cbCount = calc.cbCount;
      newRow.lep = calc.lep;
      newRow.rep = calc.rep;
    }
    setPendingUpdates((prev) => ({ ...prev, [newRow.id]: newRow }));
    return newRow;
  };

  // 새 행 추가 (+ 버튼 클릭 시)
  const handleAddRow = () => {
    const newRow = {
      id: 'new_' + new Date().getTime(),
      itemName: '',
      systemCode: '',
      endBar: '',
      itemType: 'R',
      width: '',
      length: '',
      cbCount: '',
      lep: '',
      rep: '',
      weight: '',
      neWeight: '',
      error: false,
    };
    setData((prev) => [...prev, newRow]);
  };

  // 변경사항 적용 (적용 버튼 클릭)
  const handleBulkSave = async () => {
    setApplyLoading(true);
    const invalidMessages = [];
    // 각 행에 대해 필수 값 체크 (예: 품명, 사양코드, End-bar, 품목종류)
    const updatedData = data.map((row, index) => {
      let hasError = false;
      const requiredFields = ['itemName', 'systemCode', 'endBar', 'itemType'];
      requiredFields.forEach((field) => {
        if (!row[field] || row[field].toString().trim() === '') {
          invalidMessages.push(`인덱스 ${index + 1} 에 대해 ${field} 값이 누락되었습니다.`);
          hasError = true;
        }
      });
      return { ...row, error: hasError };
    });
    if (invalidMessages.length > 0) {
      setData(updatedData);
      alert(invalidMessages.join('\n'));
      setApplyLoading(false);
      return;
    }
    try {
      const updates = Object.values(pendingUpdates);
      const updatePromises = updates.map((row) => {
        if (String(row.id).startsWith('new_')) {
          return axios.post('/api/item/standard', row);
        } else {
          return axios.put(`/api/item/standard/${row.id}`, row);
        }
      });
      await Promise.all(updatePromises);
      await fetchData();
      setPendingUpdates({});
      alert('적용되었습니다.');
    } catch (error) {
      console.error('Error saving updates:', error);
    }
    setApplyLoading(false);
  };

  // 선택한 행 삭제 (삭제 버튼 클릭)
  const handleDelete = async () => {
    if (!selectedItemId) return;
    try {
      await axios.delete(`/api/item/standard/${selectedItemId}`);
      await fetchData();
      setSelectedItemId(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // 셀 더블클릭 이벤트 - 사양코드, End-bar, 품목종류인 경우 모달을 띄움
  const handleCellDoubleClick = (params) => {
    if (['systemCode', 'endBar', 'itemType'].includes(params.field)) {
      setModalData(params.row);
      setModalOpen(true);
    }
  };

  // 모달 닫기
  const handleModalClose = () => {
    setModalOpen(false);
    setModalData(null);
  };

  // 모달 저장: 모달에서 선택한 값을 해당 행에 업데이트
  const handleSaveModal = () => {
    if (modalData) {
      setData((prev) => prev.map((row) => (row.id === modalData.id ? modalData : row)));
      setPendingUpdates((prev) => ({ ...prev, [modalData.id]: modalData }));
    }
    handleModalClose();
  };

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
                  processRowUpdate={handleProcessRowUpdate}
                  disableSelectionOnClick
                  getRowId={(row) => row.id}
                  onRowClick={(params) => setSelectedItemId(params.id)}
                  onCellDoubleClick={handleCellDoubleClick}
                  experimentalFeatures={{ newEditingApi: true }}
                  columnHeaderHeight={30}
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
                    },
                    '& .error-cell': { backgroundColor: 'red', color: 'white' },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      whiteSpace: 'pre-wrap',
                      textAlign: 'center',
                      lineHeight: '1.2',
                    },
                    '& .MuiDataGrid-footerContainer': { display: '' },
                  }}
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" mb={1} spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleBulkSave}
                  disabled={Object.keys(pendingUpdates).length === 0 || applyLoading}
                >
                  {applyLoading ? <CircularProgress size={24} color="inherit" /> : '적용'}
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRow}>
                  추가
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  disabled={!selectedItemId}
                >
                  삭제
                </Button>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>

      {/* 사양코드, End-bar, 품목종류 선택용 모달 */}
      {isModalOpen && modalData && (
        <Dialog open={isModalOpen} onClose={handleModalClose} fullWidth maxWidth="sm">
          <DialogTitle>값 선택</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <SearchableSelect
                label="사양코드"
                options={specificCodes.map((row) => row.systemCode)}
                value={modalData.systemCode || ''}
                onChange={(e) => setModalData((prev) => ({ ...prev, systemCode: e.target.value }))}
              />
              <SearchableSelect
                label="End-bar"
                options={endBars.map((row) => row.materialCode)}
                value={modalData.endBar || ''}
                onChange={(e) => setModalData((prev) => ({ ...prev, endBar: e.target.value }))}
              />
              <SearchableSelect
                label="품목종류"
                options={itemTypeOptions}
                value={modalData.itemType || ''}
                onChange={(e) => setModalData((prev) => ({ ...prev, itemType: e.target.value }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose} color="secondary">
              취소
            </Button>
            <Button onClick={handleSaveModal} color="primary">
              저장
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Items;
