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

const Items = () => {
  const [data, setData] = useState([]); // 규격품목 데이터
  const [storeMaterials, setStoreMaterials] = useState([]); // materialCode 데이터
  const [endBars, setEndBars] = useState([]); // End-bar 데이터
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [applyLoading, setApplyLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const navigate = useNavigate();

  // ✨ 새 행을 위한 임시 음수 ID 카운터
  const [tempIdCounter, setTempIdCounter] = useState(-1);

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
    fetchStoreMaterials();
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

  // API 호출: /api/item/store의 materialCode 데이터
  const fetchStoreMaterials = async () => {
    try {
      const response = await axios.get('/api/item/store');
      setStoreMaterials(response.data.table);
    } catch (error) {
      console.error('Error fetching store materials:', error);
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

  const recalcValues = (newData, oldData, C_PITCH) => {
    // 어떤 필드가 변경되었는지 판별
    let source = '';
    if (newData.length !== oldData.length) {
      source = 'length';
    } else if (newData.cbCount !== oldData.cbCount) {
      source = 'cbCount';
    } else if (newData.lep !== oldData.lep) {
      source = 'lep';
    } else if (newData.rep !== oldData.rep) {
      source = 'rep';
    } else {
      source = 'none';
    }
    console.log(source, C_PITCH);

    // 중간 계산에 사용할 변수들
    let length, cbCount, lep, rep;
    let errorFlag = false;

    // **소수점 첫째 자리까지 사사오입(반올림)**을 위한 헬퍼 함수
    const roundToOne = (value) => {
      // value가 양수라고 가정할 때 Math.round는 반올림(사사오입) 동작을 수행한다.
      return Math.round(value * 10) / 10;
    };

    if (source === 'length') {
      console.log('길이(length) 수정됨');

      // 1) length 계산 → 소수점 첫째 자리까지 반올림
      length = Number(newData.length);
      length = roundToOne(length);

      // 2) cbCount 재계산 (소수점 없는 정수)
      const C_PITCH_FROM_SPEC = storeMaterials.find((item) => item.materialCode === newData.systemCode)?.cWidth || 100;
      cbCount = Math.floor(length / C_PITCH_FROM_SPEC) + 1;

      // 3) lep, rep 계산
      let total = length - (cbCount - 1) * C_PITCH_FROM_SPEC;
      lep = total / 2;
      rep = total / 2;

      // lep/rep가 최소값(40mm)보다 작아질 때까지 CB 수 조정
      while ((lep < 40 || rep < 40) && cbCount > 1) {
        cbCount--;
        total = length - (cbCount - 1) * C_PITCH_FROM_SPEC;
        lep = total / 2;
        rep = total / 2;
      }

      // total이 200 이상이면 에러 플래그
      if (total >= 200) {
        errorFlag = true;
      }
      console.log('CB 수:', cbCount);

      // 4) lep, rep도 소수점 첫째 자리까지 반올림
      lep = roundToOne(lep);
      rep = roundToOne(rep);

    } else if (source === 'cbCount') {
      // 1) length는 이전(oldData)을 그대로 사용 → 소수점 첫째 자리까지 반올림
      length = Number(oldData.length);
      length = roundToOne(length);

      // 2) 새로운 cbCount 값
      cbCount = Number(newData.cbCount);
      const C_PITCH_FROM_SPEC = storeMaterials.find((item) => item.materialCode === oldData.systemCode)?.cWidth || 100;

      // 3) lep, rep 계산
      let total = length - (cbCount - 1) * C_PITCH_FROM_SPEC;
      lep = total / 2;
      rep = total / 2;

      // total이 200 이상이면 에러 플래그
      if (total >= 200) {
        errorFlag = true;
      }

      // lep, rep 값 반올림
      lep = roundToOne(lep);
      rep = roundToOne(rep);

    } else if (source === 'lep') {
      // 1) length는 이전(oldData)을 그대로 사용 → 반올림
      length = Number(oldData.length);
      length = roundToOne(length);

      // 2) cbCount도 이전 값을 가져옴
      cbCount = Number(oldData.cbCount);
      const C_PITCH_FROM_SPEC = storeMaterials.find((item) => item.materialCode === oldData.systemCode)?.cWidth || 100;

      // 3) total 계산
      let total = length - (cbCount - 1) * C_PITCH_FROM_SPEC;

      // 4) 새로운 lep 값 (사용자가 입력한 값)
      let newLep = Number(newData.lep);
      newLep = roundToOne(newLep);

      // 5) 새로운 rep 계산 및 CB 조정 로직
      let newRep = total - newLep;

      // lep가 C_PITCH를 넘어갈 경우 CB 감소
      if (newLep > C_PITCH_FROM_SPEC || newLep > total) {
        cbCount -= 1;
        total = length - (cbCount - 1) * C_PITCH_FROM_SPEC;
        newRep = total - newLep;
      }
      // rep가 C_PITCH를 넘어갈 경우 CB 증가
      if (newRep > C_PITCH_FROM_SPEC || newRep > total) {
        cbCount += 1;
        total = length - (cbCount - 1) * C_PITCH_FROM_SPEC;
        newRep = total - newLep;
      }

      // total이 200 이상이면 에러 플래그
      if (total >= 200) {
        errorFlag = true;
      }

      // lep, rep 반올림
      lep = roundToOne(newLep);
      rep = roundToOne(newRep);

    } else if (source === 'rep') {
      // 1) length는 이전(oldData)을 그대로 사용 → 반올림
      length = Number(oldData.length);
      length = roundToOne(length);

      // 2) cbCount도 이전 값
      cbCount = Number(oldData.cbCount);
      const C_PITCH_FROM_SPEC = storeMaterials.find((item) => item.materialCode === oldData.systemCode)?.cWidth || 100;

      // 3) total 계산
      let total = length - (cbCount - 1) * C_PITCH_FROM_SPEC;

      // 4) 새로운 rep 값 (사용자 입력)
      let newRep = Number(newData.rep);
      newRep = roundToOne(newRep);

      // 5) lep 계산 및 CB 조정 로직
      let newLep = total - newRep;

      // rep이 C_PITCH를 넘어갈 경우 CB 감소
      if (newRep > C_PITCH_FROM_SPEC || newRep > total) {
        cbCount -= 1;
        total = length - (cbCount - 1) * C_PITCH_FROM_SPEC;
        newLep = total - newRep;
      }
      // lep이 C_PITCH를 넘어갈 경우 CB 증가
      if (newLep > C_PITCH_FROM_SPEC || newLep > total) {
        cbCount += 1;
        total = length - (cbCount - 1) * C_PITCH_FROM_SPEC;
        newLep = total - newRep;
      }

      // total이 200 이상이면 에러 플래그
      if (total >= 200) {
        errorFlag = true;
      }

      // lep, rep 반올림
      lep = roundToOne(newLep);
      rep = roundToOne(newRep);

    } else {
      // 아무 변경사항이 없으면 단순 병합 후 반환
      return { ...oldData, ...newData };
    }

    // 최종 객체 반환 시에도 length, lep, rep을 소수점 첫째 자리까지 반올림한 값으로 채워서 리턴
    return {
      ...newData,
      length: roundToOne(length),
      cbCount: cbCount,
      lep: roundToOne(lep),
      rep: roundToOne(rep),
      error: errorFlag,
    };
  };

  // 인라인 편집으로 행 업데이트 시 처리 (폭, 길이, 사양코드 변경 시 자동 계산)
  const handleProcessRowUpdate = (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;
    const C_PITCH_FROM_SPEC = storeMaterials.find((item) => item.materialCode === newRow.systemCode)?.cWidth || 100;

    const updatedRow = recalcValues(
      {
        length: newRow.length,
        cbCount: newRow.cbCount,
        lep: newRow.lep,
        rep: newRow.rep,
      },
      {
        length: oldRow.length,
        cbCount: oldRow.cbCount,
        lep: oldRow.lep,
        rep: oldRow.rep,
      },
      C_PITCH_FROM_SPEC,
    );
    newRow.cbCount = updatedRow.cbCount;
    newRow.lep = updatedRow.lep;
    newRow.rep = updatedRow.rep;
    if (updatedRow.error) {
      // 에러가 발생한 셀에 클래스 추가 (임의의 필드 선택)
      return { ...newRow, __error__: true };
    }
    setPendingUpdates((prev) => ({ ...prev, [newRow.id]: newRow }));
    return { ...newRow, __error__: updatedRow.error };
  };

  // ✨ 새 행 추가 (+ 버튼 클릭 시) - 'new_' 대신 음수 ID 사용
  const handleAddRow = () => {
    const newRow = {
      id: tempIdCounter, // 임시 음수 ID 할당
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
    };
    setData((prev) => [...prev, newRow]);
    setTempIdCounter((prev) => prev - 1); // 다음 ID를 위해 카운터 1 감소
  };

  // ✨ 변경사항 적용 (적용 버튼 클릭) - ID가 음수인지 확인하여 신규/수정 구분
  const handleBulkSave = async () => {
    setApplyLoading(true);
    const invalidMessages = [];
    // 각 행에 대해 필수 값 체크 (예: 품명, 사양코드, End-bar, 품목종류)
    const updatedData = data.map((row, index) => {
      console.log('Row being validated:', row); // Add this line
      let hasError = false;
      const requiredFields = ['itemName', 'systemCode', 'endBar', 'itemType'];
      requiredFields.forEach((field) => {
        if (!row[field] || row[field].toString().trim() === '') {
          invalidMessages.push(`인덱스 ${index + 1} 에 대해 ${field} 값이 누락되었습니다.`);
          hasError = true;
        }
      });
      return { ...row };
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
        // ID가 음수이면 신규 행성이므로 POST, 양수이면 기존 행성이므로 PUT
        if (row.id < 0) {
          // POST 요청 시에는 백엔드에서 ID를 생성하므로, 프론트에서 만든 임시 id는 제거
          const { id, ...newRowData } = row;
          return axios.post('/api/item/standard', newRowData);
        } else {
          return axios.put(`/api/item/standard/${row.id}`, row);
        }
      });
      await Promise.all(updatePromises);
      await fetchData(); // 데이터 다시 불러오기
      setPendingUpdates({});
      alert('적용되었습니다.');
    } catch (error) {
      console.error('Error saving updates:', error);
    }
    setApplyLoading(false);
  };

  // 선택한 행 삭제 (삭제 버튼 클릭)
  const handleDelete = async () => {
    // 임시로 추가된 행(음수 ID)은 DB에 없으므로 바로 화면에서만 제거
    if (selectedItemId < 0) {
      setData((prevData) => prevData.filter((row) => row.id !== selectedItemId));
      setSelectedItemId(null);
      // pendingUpdates에서도 해당 항목 제거
      setPendingUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[selectedItemId];
        return newUpdates;
      });
      return;
    }

    // DB에 저장된 행 삭제
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
                  getRowClassName={(params) => (params.row.__error__ ? 'error-cell' : '')}
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
                options={storeMaterials.map((row) => row.materialCode)}
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