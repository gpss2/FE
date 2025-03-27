import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import {
  Box,
  Grid,
  Stack,
  Button,
  Modal,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { useNavigate } from 'react-router-dom';
import RangeDataGrid from './RangeDataGrid';
import SearchableSelect from '../../../components/shared/SearchableSelect';
import StartDataGrid from './StartDataGRid';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

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

const topColumns = [
  indexColumn,
  { field: 'orderNumber', headerName: '수주번호', flex: 1 },
  { field: 'category', headerName: '구분', flex: 1 },
  { field: 'orderDate', headerName: '수주일자', flex: 1 },
  { field: 'customerCode', headerName: '수주처명', flex: 1 },
  { field: 'deliveryDate', headerName: '납기일자', flex: 1 },
  { field: 'totalQuantity', headerName: '총수량', flex: 1 },
  { field: 'totalWeight', headerName: '총중량(Kg)', flex: 1 },
  { field: 'taskNumber', headerName: '태스크번호', flex: 1 },
];

const bottomColumns = [
  indexColumn,
  { field: 'drawingNumber', headerName: '도면\n번호', width: 60 },
  { field: 'itemNo', headerName: '품목 번호', width: 60 },
  { field: 'itemType', headerName: '품목\n종류', width: 60 },
  { field: 'itemName', headerName: '품명', width: 60 },
  { field: 'specCode', headerName: '사양코드', flex: 1 },
  { field: 'endBar', headerName: 'EndBar', flex: 1 },
  { field: 'width_mm', headerName: '폭', width: 60 },
  { field: 'length_mm', headerName: '길이', width: 60 },
  { field: 'cbCount', headerName: 'CB 수', width: 60 },
  { field: 'lep_mm', headerName: 'LEP', width: 60 },
  { field: 'rep_mm', headerName: 'REP', width: 60 },
  { field: 'quantity', headerName: '수량', width: 60 },
  { field: 'weight_kg', headerName: '중량', width: 60 },
  { field: 'groupNumber', headerName: '그룹번호', width: 160 },
];

// 사양코드 선택 다이얼로그 컴포넌트
const SpecCodeDialog = ({ open, onClose, specCodes, onSelect, currentValue }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCodes = specCodes.filter((code) => {
    const term = searchTerm.toLowerCase();
    return (
      code.systemCode.toLowerCase().includes(term) ||
      code.bbCode.toLowerCase().includes(term) ||
      code.cbCode.toLowerCase().includes(term)
    );
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>사양코드 선택</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>사양코드</TableCell>
                <TableCell>BB 코드</TableCell>
                <TableCell>CB 코드</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCodes.length > 0 ? (
                filteredCodes.map((code) => (
                  <TableRow
                    key={code.systemCode}
                    hover
                    onClick={() => onSelect(code.systemCode)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor:
                        currentValue === code.systemCode ? 'rgba(25, 118, 210, 0.12)' : 'inherit',
                    }}
                  >
                    <TableCell>{code.systemCode}</TableCell>
                    <TableCell>{code.bbCode}</TableCell>
                    <TableCell>{code.cbCode}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

const Range = () => {
  const [topData, setTopData] = useState([]);
  const [bottomData, setBottomData] = useState([]);
  const [selectOrderId, setSelectOrderId] = useState(null);
  const [selectGroupId, setSelectGroupId] = useState(null);
  const [selectionModel, setSelectionModel] = useState([]); // 일반 클릭 (회색)
  const [mergeSelection, setMergeSelection] = useState([]); // CTRL+클릭으로 선택된 그룹(병합/분리용)

  // 모달 상태 변수
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'all' 또는 'group'
  const [modalData, setModalData] = useState({
    itemType: '',
    itemName: '',
    specCode: '',
    endBar: '',
  });

  // 항목 목록을 위한 상태 변수
  const [standardItems, setStandardItems] = useState([]);
  const [specCode, setSpecCode] = useState([]);
  const [meterialCode, setMeterialCode] = useState([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState('');

  // 사양코드 선택 다이얼로그
  const [specCodeDialogOpen, setSpecCodeDialogOpen] = useState(false);

  const navigate = useNavigate();
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchTopData();
    fetchItemOptions(); // 항목 옵션 데이터 불러오기
  }, [navigate]);

  // 항목 옵션 불러오기
  const fetchItemOptions = async () => {
    try {
      // 품명 목록 가져오기
      const standardResponse = await axios.get('/api/item/standard');
      setStandardItems(standardResponse.data.table);

      // 사양코드 목록 가져오기
      const specResponse = await axios.get('/api/item/specific');
      setSpecCode(specResponse.data.table);

      // EndBar 목록 가져오기
      const materialResponse = await axios.get('/api/item/material');
      setMeterialCode(materialResponse.data.table);
    } catch (error) {
      console.error('Error fetching item options:', error);
    }
  };

  // 상단 테이블 데이터를 불러온 후 로컬 스토리지에서 선택된 행 정보 복원
  useEffect(() => {
    if (topData.length > 0) {
      // 로컬 스토리지에서 선택된 주문 ID 가져오기
      const savedOrderId = localStorage.getItem('rangeSelectedOrderId');

      if (savedOrderId) {
        // 저장된 ID가 현재 데이터에 존재하는지 확인
        const orderExists = topData.some((order) => order.id === parseInt(savedOrderId));

        if (orderExists) {
          // 저장된 ID가 존재하면 상태 복원
          setSelectOrderId(parseInt(savedOrderId));

          // 선택된 주문 번호 저장
          const selectedOrder = topData.find((order) => order.id === parseInt(savedOrderId));
          if (selectedOrder) {
            setSelectedOrderNumber(selectedOrder.orderNumber);
          }

          // 하단 테이블 데이터 불러오기
          fetchBottomData(parseInt(savedOrderId));
        }
      }
    }
  }, [topData]);

  const fetchTopData = async () => {
    try {
      const response = await axios.get('/api/order/list');
      const processedData = response.data.table.map((row) => ({
        ...row,
        deliveryDate: row.deliveryDate.split('T')[0],
      }));
      setTopData(processedData);
    } catch (error) {
      console.error('Error fetching top data:', error);
    }
  };

  const fetchBottomData = async (orderId) => {
    try {
      const response = await axios.get(`/api/plan/order-details/${orderId}`);
      setBottomData(response.data.table);
    } catch (error) {
      console.error('Error fetching bottom data:', error);
    }
  };

  // 상단 테이블 클릭 시 해당 order의 하단 데이터를 로드하며 모든 선택 초기화
  const handleRowClick = (params) => {
    const selectedOrderId = params.id;
    const selectedOrder = topData.find((order) => order.id === selectedOrderId);

    if (selectedOrder) {
      setSelectedOrderNumber(selectedOrder.orderNumber);
    }

    // 로컬 스토리지에 선택한 주문 ID 저장
    localStorage.setItem('rangeSelectedOrderId', selectedOrderId);

    setSelectOrderId(selectedOrderId);
    setSelectGroupId(null);
    setSelectionModel([]);
    setMergeSelection([]);
    fetchBottomData(selectedOrderId);
  };

  // 하단 테이블 셀 클릭: CTRL 여부에 따라 동작을 구분
  const handleCellClick = (e, params) => {
    const clickedRow = params.row;
    // 그룹 식별자: groupNumber가 있으면 그것, 없으면 drawingNumber 사용
    const groupIdentifier =
      clickedRow.groupNumber !== null ? clickedRow.groupNumber : clickedRow.drawingNumber;
    setSelectGroupId(groupIdentifier);

    if (e.ctrlKey) {
      // CTRL+클릭: 해당 그룹 전체가 병합/분리용 선택으로 반영
      setMergeSelection((prev) => {
        if (prev.includes(groupIdentifier)) {
          return prev.filter((g) => g !== groupIdentifier);
        } else {
          return [...prev, groupIdentifier];
        }
      });
    } else {
      // 일반 클릭: 같은 그룹의 모든 행 선택 (회색)
      const sameRows = bottomData
        .filter((row) => {
          const idt = row.groupNumber !== null ? row.groupNumber : row.drawingNumber;
          return idt === groupIdentifier;
        })
        .map((row) => row.id);
      setSelectionModel((prevSelection) => {
        const newSet = new Set(prevSelection);
        sameRows.forEach((id) => {
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
        });
        return Array.from(newSet);
      });
    }
  };

  // 병합: CTRL 선택(mergeSelection에 포함된 그룹)에 해당하는 행들에서 도면번호 추출 후 payload 전송
  const handleMerge = async () => {
    if (mergeSelection.length === 0) {
      console.error('선택된 도면이 없습니다.');
      return;
    }

    // 선택된 그룹의 사양코드, 엔드바, 품명, 품목 종류가 다를 경우 에러 처리
    const selectedRows = bottomData.filter((row) => {
      const groupIdentifier = row.groupNumber !== null ? row.groupNumber : row.drawingNumber;
      return mergeSelection.includes(groupIdentifier);
    });

    // 선택된 그룹의 데이터가 일치하는지 검사
    const firstRow = selectedRows[0];
    const hasDifferentValues = selectedRows.some(
      (row) =>
        row.itemType !== firstRow.itemType ||
        row.itemName !== firstRow.itemName ||
        row.specCode !== firstRow.specCode ||
        row.endBar !== firstRow.endBar,
    );

    if (hasDifferentValues) {
      alert('서로 다른 사양코드나 엔드바, 품명, 품목 종류를 가진 그룹은 병합할 수 없습니다.');
      return;
    }

    const drawingNumbers = selectedRows.map((row) => row.drawingNumber);
    const uniqueDrawingNumbers = Array.from(new Set(drawingNumbers));
    try {
      await axios.post(`/api/plan/order-groups/${selectOrderId}/concat`, {
        drawingNumbers: uniqueDrawingNumbers,
      });
      setMergeSelection([]);
      fetchBottomData(selectOrderId);
    } catch (error) {
      console.error('병합 에러:', error);
    }
  };

  // 분리: 선택된 그룹번호를 payload로 전송
  const handleSplit = async () => {
    if (!selectGroupId) {
      console.error('분리할 그룹이 선택되지 않았습니다.');
      return;
    }
    try {
      await axios.post(`/api/plan/order-groups/${selectOrderId}/split`, {
        groupNumber: selectGroupId,
      });
      setSelectionModel([]);
      setMergeSelection([]);
      setSelectGroupId(null);
      fetchBottomData(selectOrderId);
    } catch (error) {
      console.error('분리 에러:', error);
    }
  };

  // 모달 관련 함수
  // 모달 열기 핸들러 - 미리 현재 값들을 가져와서 설정
  const handleOpenModal = (type) => {
    // 모달 타입 설정 ('all' 또는 'group')
    setModalType(type);

    // 데이터 설정을 위한 기본값 준비
    let selectedData = {
      itemType: '',
      itemName: '',
      specCode: '',
      endBar: '',
    };

    // 선택된 데이터에서 값 가져오기
    if (type === 'all' && bottomData.length > 0) {
      // 전체 일괄 변경의 경우 첫 번째 행의 값을 기본값으로 사용
      selectedData = {
        itemType: bottomData[0].itemType || '',
        itemName: bottomData[0].itemName || '',
        specCode: bottomData[0].specCode || '',
        endBar: bottomData[0].endBar || '',
      };
    } else if (type === 'group' && mergeSelection.length > 0) {
      // 그룹 일괄 변경의 경우 선택된 첫 번째 그룹의 값을 사용
      const selectedGroupId = mergeSelection[0];
      const groupRow = bottomData.find((row) => {
        const groupIdentifier = row.groupNumber !== null ? row.groupNumber : row.drawingNumber;
        return groupIdentifier === selectedGroupId;
      });

      if (groupRow) {
        selectedData = {
          itemType: groupRow.itemType || '',
          itemName: groupRow.itemName || '',
          specCode: groupRow.specCode || '',
          endBar: groupRow.endBar || '',
        };
      }
    }

    // 모달 데이터 설정
    setModalData(selectedData);

    // 모달 열기
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // 모달 저장 핸들러
  const handleSaveModal = async () => {
    // 변경할 데이터 준비
    const changedData = {};

    // 값이 입력된 필드만 포함
    if (modalData.itemType) changedData.itemType = modalData.itemType;
    if (modalData.itemName) changedData.itemName = modalData.itemName;
    if (modalData.specCode) changedData.specCode = modalData.specCode;
    if (modalData.endBar) changedData.endBar = modalData.endBar;

    // 변경할 데이터가 없으면 저장하지 않음
    if (Object.keys(changedData).length === 0) {
      alert('변경할 데이터를 입력하세요.');
      return;
    }

    try {
      if (modalType === 'all') {
        // 전체 일괄 변경
        await axios.put(`/api/plan/order-details/${selectOrderId}`, changedData);
      } else if (modalType === 'group') {
        // 선택된 그룹들에 대해 개별적으로 API 호출
        for (const groupId of mergeSelection) {
          await axios.put(`/api/plan/order-details/${selectOrderId}`, {
            ...changedData,
            group_id: groupId,
          });
        }
      }

      // 성공 후 모달 닫고 데이터 다시 불러오기
      setIsModalOpen(false);
      fetchBottomData(selectOrderId);
    } catch (error) {
      console.error('데이터 저장 에러:', error);
      alert('데이터 저장 중 오류가 발생했습니다.');
    }
  };

  // 모달 폼 필드 값 변경 핸들러
  const handleModalFieldChange = (field, value) => {
    console.log(`Updating ${field} to:`, value);
    setModalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 사양코드 선택 다이얼로그 열기
  const handleOpenSpecCodeDialog = () => {
    setSpecCodeDialogOpen(true);
  };

  // 사양코드 선택
  const handleSelectSpecCode = (code) => {
    handleModalFieldChange('specCode', code);
    setSpecCodeDialogOpen(false);
  };

  return (
    <PageContainer title="계획 범위 지정">
      {/* 상단 테이블 */}
      <Grid container spacing={2}>
        <Grid item xs={12} mt={3}>
          <ParentCard title="태스크범위 지정 화면">
            <Box sx={{ height: 'calc(50vh)', width: '100%' }}>
              <StartDataGrid
                rows={topData}
                columns={topColumns}
                columnHeaderHeight={30}
                rowHeight={25}
                onRowClick={handleRowClick}
                // 선택된 행 하이라이트를 위한 속성 추가
                selectionModel={selectOrderId ? [selectOrderId] : []}
                rowSelectionModel={selectOrderId ? [selectOrderId] : []}
                keepNonExistentRowsSelected={false}
                sx={{
                  '& .MuiDataGrid-cell': {
                    border: '1px solid black',
                    fontSize: '12px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                  },
                  '& .MuiDataGrid-columnHeader': {
                    fontSize: '14px',
                    backgroundColor: '#B2B2B2',
                    border: '1px solid black',
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center',
                    lineHeight: '1.2',
                  },
                  '& .MuiDataGrid-footerContainer': { display: '' },
                  '& .index-cell': { backgroundColor: '#B2B2B2' },
                  // 선택된 행에 대한 스타일 강화
                  '& .Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.12) !important',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.2) !important',
                    },
                  },
                }}
              />
            </Box>
          </ParentCard>
        </Grid>
      </Grid>

      {/* 하단 테이블 */}
      <Grid container spacing={2}>
        <Grid item xs={12} mt={3}>
          <ParentCard title="그룹범위 지정 화면">
            <Box sx={{ height: 'calc(50vh)', width: '100%' }}>
              <RangeDataGrid
                rows={bottomData}
                columns={bottomColumns}
                selectionModel={selectionModel}
                mergeSelection={mergeSelection}
                onRowClick={handleCellClick}
              />
            </Box>
            <Stack direction="row" justifyContent="flex-end" alignItems="center" mt={2}>
              {/* 새로운 버튼 추가 */}
              <Button
                variant="contained"
                color="primary"
                disabled={!selectOrderId}
                onClick={() => handleOpenModal('all')}
                sx={{ marginRight: '10px' }}
              >
                전체 일괄 변경
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={mergeSelection.length === 0}
                onClick={() => handleOpenModal('group')}
                sx={{ marginRight: '10px' }}
              >
                그룹 일괄 변경
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleMerge}
                sx={{ marginRight: '10px' }}
              >
                병합
              </Button>
              <Button
                variant="contained"
                color="secondary"
                disabled={!selectGroupId}
                onClick={handleSplit}
              >
                분리
              </Button>
            </Stack>
          </ParentCard>
        </Grid>
      </Grid>

      {/* 일괄 변경 모달 */}
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={3}>
            {modalType === 'all' ? (
              <>선택한 수주번호 '{selectedOrderNumber}' 에 대한 모든 값을 다음과 같이 바꿉니다.</>
            ) : (
              <>
                선택한 수주 번호 '{selectedOrderNumber}'에 대한 {mergeSelection.length}개의 그룹 [
                {mergeSelection.join(', ')}] 에 대한 값을 다음과 같이 바꿉니다.
              </>
            )}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <SearchableSelect
                label="품목 종류"
                options={['R', 'C', 'Angle 대', 'Angle 소', 'EndBar', 'GB', '각 Pipe', '특수 Type']}
                value={modalData.itemType}
                onChange={(e) => handleModalFieldChange('itemType', e.target.value)}
              />
            </Grid>
            <Grid item xs={3}>
              <SearchableSelect
                label="품명"
                options={['SteelGrating', ...standardItems.map((row) => row.itemName)]}
                value={modalData.itemName}
                onChange={(e) => handleModalFieldChange('itemName', e.target.value)}
              />
            </Grid>

            {/* 사양코드 - 직접 구현한 버튼/텍스트 필드 조합으로 대체 */}
            <Grid item xs={3}>
              <Typography variant="body2" mb={1}>
                사양코드
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  value={modalData.specCode || ''}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleOpenSpecCodeDialog}
                  sx={{ ml: 1, height: '40px' }}
                >
                  보기
                </Button>
              </Box>
            </Grid>

            <Grid item xs={3}>
              <SearchableSelect
                label="EndBar"
                options={meterialCode.map((row) => row.materialCode)}
                value={modalData.endBar}
                onChange={(e) => handleModalFieldChange('endBar', e.target.value)}
              />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
            <Button variant="outlined" onClick={handleModalClose}>
              취소
            </Button>
            <Button variant="contained" onClick={handleSaveModal}>
              저장
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* 사양코드 선택 다이얼로그 */}
      <SpecCodeDialog
        open={specCodeDialogOpen}
        onClose={() => setSpecCodeDialogOpen(false)}
        specCodes={specCode}
        onSelect={handleSelectSpecCode}
        currentValue={modalData.specCode}
      />
    </PageContainer>
  );
};

export default Range;
