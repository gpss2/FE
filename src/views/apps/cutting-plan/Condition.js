import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, Stack, Button, Typography, Modal, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from '../../../components/shared/SearchableSelect';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// 모달 스타일
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const topColumns = [
  { field: 'taskNumber', headerName: '태스크번호', flex: 1 },
  { field: 'orderNumber', headerName: '수주번호', flex: 1 },
  { field: 'category', headerName: '구분', flex: 1 },
  { field: 'orderDate', headerName: '수주일자', flex: 1 },
  { field: 'customerCode', headerName: '수주처명', flex: 1 },
  { field: 'deliveryDate', headerName: '납기일자', flex: 1 },
  { field: 'totalQuantity', headerName: '총수량', flex: 1 },
  { field: 'totalWeight', headerName: '총중량(Kg)', flex: 1 },
];

const bottomColumns = [
  { field: 'drawingNumber', headerName: '도면번호', flex: 1 },
  { field: 'itemNo', headerName: '품목번호', flex: 1 },
  { field: 'itemType', headerName: '품목종류', editable: true, flex: 1 },
  { field: 'itemName', headerName: '품명', editable: true, flex: 1 },
  { field: 'specCode', headerName: '사양코드', flex: 1 },
  { field: 'endBar', headerName: 'EndBar', flex: 1 },
  { field: 'width_mm', headerName: '폭(mm)', editable: true, flex: 1 },
  { field: 'length_mm', headerName: '길이(mm)', editable: true, flex: 1 },
  { field: 'cbCount', headerName: 'CB 수', editable: true, flex: 1 },
  { field: 'lep_mm', headerName: 'LEP(mm)', editable: true, flex: 1 },
  { field: 'rep_mm', headerName: 'REP(mm)', editable: true, flex: 1 },
  { field: 'quantity', headerName: '수량', editable: true, flex: 1 },
  { field: 'weight_kg', headerName: '중량(Kg)', editable: true, flex: 1 },
  { field: 'neWeight_kg', headerName: 'NE 중량(Kg)', editable: true, flex: 1 },
];

const Condition = () => {
  const [topData, setTopData] = useState([]);
  const [bottomData, setBottomData] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState('');
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [meterialCode, setMeterialCode] = useState([]);
  const [specCode, setSpecCode] = useState([]);
  const navigate = useNavigate();
  const [newData, setNewData] = useState({
    drawingNumber: '',
    orderNumber: '',
    itemType: '',
    itemName: '',
    specCode: '',
    endBar: '',
    width_mm: '',
    length_mm: '',
    cbCount: '',
    lep_mm: '',
    rep_mm: '',
    quantity: '',
    weight_kg: '',
    neWeight_kg: '',
  });

  // 데이터 입력(템플릿) 모달 상태 및 선택값
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedSpecific, setSelectedSpecific] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [templateDownloaded, setTemplateDownloaded] = useState(false);

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

  const handleAddModalOpen = () => {
    const lastData = bottomData[bottomData.length - 1];
    const nextDrawingNumber = lastData
      ? String(Number(lastData.drawingNumber)).padStart(2, '0')
      : '01';
    const nextOrderNumber = lastData ? String(Number(lastData.orderNumber) + 1) : '1';

    setNewData({
      drawingNumber: nextDrawingNumber,
      orderNumber: nextOrderNumber,
      itemType: 'R',
      itemName: 'Steel Grating',
      specCode: '',
      endBar: '',
      width_mm: '',
      length_mm: '',
      cbCount: '',
      lep_mm: '',
      rep_mm: '',
      quantity: '',
      weight_kg: '',
      neWeight_kg: '',
    });
    setAddModalOpen(true);
  };

  const fetchMeterialCode = async () => {
    try {
      const response = await axios.get('/api/item/material');
      setMeterialCode(response.data.table);
    } catch (error) {
      console.error('Error fetching left table data:', error);
    }
  };

  const fetchSpecCode = async () => {
    try {
      const response = await axios.get('/api/item/specific');
      setSpecCode(response.data.table);
    } catch (error) {
      console.error('Error fetching right table data:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchTopData();
    fetchMeterialCode();
    fetchSpecCode();
  }, [navigate]);

  const fetchTopData = async () => {
    try {
      const response = await axios.get('/api/order/list');
      const processedData = response.data.table.map((row) => ({
        ...row,
        orderDate: row.orderDate.split('T')[0],
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
      const processedData = response.data.table.map((row, index) => ({
        ...row,
        orderNumber: index + 1,
      }));
      setBottomData(processedData);
    } catch (error) {
      console.error('Error fetching bottom data:', error);
    }
  };

  const handleRowClick = (params) => {
    const orderId = params.id;
    const orderNumber = params.row.taskNumber;
    setSelectedOrderId(orderId);
    setSelectedOrderNumber(orderNumber);
    fetchBottomData(orderId);
  };

  // 모든 값에 소수점 허용 (단, 길이 변경 시 CB수는 정수로 산출)
  const recalcValues = (newData, oldData) => {
    // 변경된 필드 판별 (우선순위: length_mm > cbCount > lep_mm > rep_mm)
    let source = 'length_mm';
    if (newData.length_mm !== oldData.length_mm) {
      source = 'length_mm';
    } else if (newData.cbCount !== oldData.cbCount) {
      source = 'cbCount';
    } else if (newData.lep_mm !== oldData.lep_mm) {
      source = 'lep_mm';
    } else if (newData.rep_mm !== oldData.rep_mm) {
      source = 'rep_mm';
    }

    let length_mm, cbCount, lep, rep;
    const half100 = 100 / 2; // 50

    if (source === 'length_mm') {
      // [길이 변경] : 입력받은 길이로부터 계산 (CB수는 CPTest 로직에 따라 정수 처리)
      length_mm = Number(newData.length_mm);
      cbCount = Math.floor(length_mm / 100) + 1;
      let baseValue = (length_mm - (cbCount - 1) * 100) / 2; // 소수점 연산
      lep = baseValue;
      rep = baseValue;

      if (cbCount % 2 !== 0 && lep < half100) {
        cbCount = cbCount - 1;
        lep = lep + half100;
        rep = lep;
      }
      if (lep < 10) {
        cbCount = cbCount - 1;
        lep = lep + half100;
        rep = lep;
      }
    } else if (source === 'cbCount') {
      // [CB수 변경] : 사용자가 입력한 cbCount(소수점 허용)를 사용, 기존의 LEP(없으면 기본 50)로 길이 재계산
      cbCount = Number(newData.cbCount);
      lep = newData.lep_mm !== undefined && newData.lep_mm !== null ? Number(newData.lep_mm) : 50;
      rep = lep;
      length_mm = (cbCount - 1) * 100 + 2 * lep;

      if (cbCount % 2 !== 0 && lep < half100) {
        lep = lep + half100;
        rep = lep;
        length_mm = (cbCount - 1) * 100 + 2 * lep;
      }
      if (lep < 10) {
        lep = lep + half100;
        rep = lep;
        length_mm = (cbCount - 1) * 100 + 2 * lep;
      }
    } else if (source === 'lep_mm' || source === 'rep_mm') {
      // [LEP 또는 REP 변경] : 변경된 값을 LEP로 적용(두 값 동일), 기존의 cbCount를 사용해 길이 계산
      lep = source === 'lep_mm' ? Number(newData.lep_mm) : Number(newData.rep_mm);
      rep = lep;
      cbCount =
        newData.cbCount !== undefined && newData.cbCount !== null
          ? Number(newData.cbCount)
          : Math.floor(Number(newData.length_mm) / 100) + 1;
      length_mm = (cbCount - 1) * 100 + 2 * lep;

      // 길이로부터 다시 CB수를 산출해 일관성 검증 (길이 변경 시 CB수는 정수 처리)
      let computedCb = Math.floor(length_mm / 100) + 1;
      if (computedCb !== cbCount) {
        cbCount = computedCb;
        let baseValue = (length_mm - (cbCount - 1) * 100) / 2;
        if (cbCount % 2 !== 0 && baseValue < half100) {
          cbCount = cbCount - 1;
          baseValue = baseValue + half100;
          length_mm = (cbCount - 1) * 100 + 2 * baseValue;
        }
        if (baseValue < 10) {
          cbCount = cbCount - 1;
          baseValue = baseValue + half100;
          length_mm = (cbCount - 1) * 100 + 2 * baseValue;
        }
        // LEP가 기준보다 작으면 forward 결과를 우선 적용
        lep = rep = lep < baseValue ? baseValue : lep;
      }
    }

    return {
      ...newData,
      length_mm, // 길이는 소수점 허용
      cbCount, // CB수는 길이 변경 시 정수로 산출, 나머지는 사용자가 입력한 소수점 값 가능
      lep_mm: lep, // LEP
      rep_mm: rep, // REP
    };
  };

  const handleProcessRowUpdate = async (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;
    // oldRow와 newRow를 비교하여 어느 필드가 변경되었는지 확인 후 재계산
    const recalculatedRow = recalcValues(newRow, oldRow);
    try {
      await axios.put(`/api/plan/order-details/${selectedOrderId}/${newRow.id}`, recalculatedRow);
      await fetchBottomData(selectedOrderId);
      await fetchTopData();
      return recalculatedRow;
    } catch (error) {
      console.error('Error updating row:', error);
      return oldRow;
    }
  };

  const handleCellDoubleClick = (params) => {
    const { field, row } = params;
    if (field === 'specCode' || field === 'endBar') {
      setModalData(row);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalData(null);
  };

  const handleSave = () => {
    const { id, specCode, endBar } = modalData;
    axios
      .put(`/api/plan/order-details/${selectedOrderId}/${id}`, { specCode, endBar })
      .then(() => {
        setBottomData((prev) =>
          prev.map((row) =>
            row.id === id
              ? { ...row, specCode: modalData.specCode, endBar: modalData.endBar }
              : row,
          ),
        );
        setModalOpen(false);
      })
      .catch((error) => console.error('Error updating row:', error));
  };

  const handleDelete = () => {
    if (!selectedDetailId) return;
    axios
      .delete(`/api/plan/order-details/${selectedOrderId}/${selectedDetailId}`)
      .then(() => {
        fetchBottomData(selectedOrderId);
        setBottomData((prev) => prev.filter((row) => row.id !== selectedDetailId));
        setSelectedDetailId(null);
      })
      .catch((error) => console.error('Error deleting row:', error));
  };

  // 데이터 입력(템플릿) 모달 관련 함수
  const handleTemplateModalOpen = () => {
    setTemplateModalOpen(true);
    setSelectedSpecific('');
    setSelectedMaterial('');
    setTemplateDownloaded(false);
  };

  const handleTemplateModalClose = () => {
    setTemplateModalOpen(false);
    setSelectedSpecific('');
    setSelectedMaterial('');
    setTemplateDownloaded(false);
  };

  const handleDownloadTemplate = async () => {
    // 이미 상태로 보유한 specCode, meterialCode 배열에서 선택한 사양코드/EndBar에 해당하는 id를 찾습니다.
    const specificItem = specCode.find((item) => item.systemCode === selectedSpecific);
    const materialItem = meterialCode.find((item) => item.materialCode === selectedMaterial);
    if (!specificItem || !materialItem) {
      console.error('선택한 사양코드 또는 EndBar 항목을 찾을 수 없습니다.');
      return;
    }
    try {
      const response = await axios.get(
        `/api/plan/order-details/${selectedOrderId}/excel-template`,
        {
          params: {
            specific_id: specificItem.id,
            material_id: materialItem.id,
          },
          responseType: 'blob',
        },
      );
      // 상단 테이블에서 현재 선택된 수주 정보를 찾아 파일명을 생성합니다.
      const selectedOrder = topData.find((order) => order.id === selectedOrderId);
      const fileName = selectedOrder
        ? `${selectedOrder.orderNumber}-${selectedOrder.customerCode}.xlsx`
        : 'excel-template.xlsx';
      // 파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTemplateDownloaded(true);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  const handleTemplateUpload = async (event) => {
    if (!selectedOrderId) return;
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`/api/plan/order-details/${selectedOrderId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchBottomData(selectedOrderId);
      setTemplateDownloaded(false);
      setTemplateModalOpen(false);
    } catch (error) {
      console.error('Error uploading modified template:', error);
    }
  };

  const handleAddModalClose = () => {
    setAddModalOpen(false);
    setNewData({
      drawingNumber: '',
      orderNumber: '',
      itemType: '',
      itemName: '',
      specCode: '',
      endBar: '',
      width_mm: '',
      length_mm: '',
      cbCount: '',
      lep_mm: '',
      rep_mm: '',
      quantity: '',
      weight_kg: '',
      neWeight_kg: '',
    });
  };

  const handleAddSave = () => {
    axios
      .post(`/api/plan/order-details/${selectedOrderId}`, newData)
      .then((response) => {
        setBottomData((prev) => [...prev, response.data]);
        setAddModalOpen(false);
        fetchBottomData(selectedOrderId);
      })
      .catch((error) => console.error('Error adding new row:', error));
  };

  return (
    <div>
      <PageContainer title="수주 및 품목 관리">
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard title="수주 선택">
              <Box sx={{ height: 'calc(30vh)', width: '100%' }}>
                <DataGrid
                  rows={topData}
                  columns={topColumns}
                  columnHeaderHeight={30}
                  rowHeight={30}
                  onRowClick={handleRowClick}
                  disableSelectionOnClick
                  sx={{
                    // 셀에 검은색 테두리 및 폰트 크기 증가
                    '& .MuiDataGrid-cell': {
                      border: '1px solid black',
                      fontSize: '1.2rem',
                    },
                    // 헤더에도 검은색 테두리 및 폰트 크기 증가
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '1.0rem',
                    },
                    // 홀수 행: 흰색 배경
                    '& .MuiDataGrid-row:nth-of-type(odd)': {
                      backgroundColor: '#ffffff',
                    },
                    // 짝수 행: 연한 회색 배경
                    '& .MuiDataGrid-row:nth-of-type(even)': {
                      backgroundColor: '#f5f5f5',
                    },
                    // 컬럼 헤더 텍스트 스타일
                    '& .MuiDataGrid-columnHeaderTitle': {
                      whiteSpace: 'pre-wrap',
                      textAlign: 'center',
                      lineHeight: '1.2',
                    },
                    '& .MuiDataGrid-footerContainer': { display: '' },
                  }}
                />
              </Box>
            </ParentCard>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard
              title={`수주별 품목명세 입력 화면 ${selectedOrderNumber ? selectedOrderNumber : ''}`}
            >
              <Box sx={{ height: 'calc(30vh)', width: '100%' }}>
                <DataGrid
                  rows={bottomData}
                  columns={bottomColumns}
                  columnHeaderHeight={45}
                  rowHeight={30}
                  processRowUpdate={handleProcessRowUpdate}
                  disableSelectionOnClick
                  getRowId={(row) => row.id}
                  onRowClick={(params) => setSelectedDetailId(params.id)}
                  experimentalFeatures={{ newEditingApi: true }}
                  onCellDoubleClick={handleCellDoubleClick}
                  sx={{
                    // 셀에 검은색 테두리 및 폰트 크기 증가
                    '& .MuiDataGrid-cell': {
                      border: '1px solid black',
                      fontSize: '1.2rem',
                    },
                    // 헤더에도 검은색 테두리 및 폰트 크기 증가
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '1.0rem',
                    },
                    // 홀수 행: 흰색 배경
                    '& .MuiDataGrid-row:nth-of-type(odd)': {
                      backgroundColor: '#ffffff',
                    },
                    // 짝수 행: 연한 회색 배경
                    '& .MuiDataGrid-row:nth-of-type(even)': {
                      backgroundColor: '#f5f5f5',
                    },
                    // 컬럼 헤더 텍스트 스타일
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
                  startIcon={<UploadFileIcon />}
                  disabled={!selectedOrderId}
                  onClick={handleTemplateModalOpen}
                >
                  양식 다운로드
                </Button>
                <Button variant="contained" component="label" disabled={!selectedOrderId}>
                  BOM 업로드
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    hidden
                    onChange={handleTemplateUpload}
                  />
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!selectedOrderId}
                  onClick={handleAddModalOpen}
                >
                  추가
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  disabled={!selectedDetailId}
                >
                  삭제
                </Button>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>

      {/* 사양코드 및 EndBar 수정 모달 */}
      {modalData && (
        <Modal open={isModalOpen} onClose={handleModalClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" mb={2}>
              데이터 수정
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <SearchableSelect
                  label="사양코드"
                  options={specCode.map((row) => row.systemCode)}
                  value={modalData.specCode}
                  onChange={(e) => setModalData((prev) => ({ ...prev, specCode: e.target.value }))}
                />
              </Grid>
              <Grid item xs={6}>
                <SearchableSelect
                  label="EndBar"
                  options={meterialCode.map((row) => row.materialCode)}
                  value={modalData.endBar}
                  onChange={(e) => setModalData((prev) => ({ ...prev, endBar: e.target.value }))}
                />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" onClick={handleModalClose}>
                취소
              </Button>
              <Button variant="contained" onClick={handleSave}>
                저장
              </Button>
            </Stack>
          </Box>
        </Modal>
      )}

      {/* 데이터 추가 모달 */}
      <Modal open={isAddModalOpen} onClose={handleAddModalClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>
            데이터 추가
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="도면번호"
              value={newData.drawingNumber}
              onChange={(e) => setNewData((prev) => ({ ...prev, drawingNumber: e.target.value }))}
            />
            <TextField
              fullWidth
              label="품목번호"
              disabled
              value={newData.orderNumber}
              onChange={(e) => setNewData((prev) => ({ ...prev, orderNumber: e.target.value }))}
            />
            <TextField
              fullWidth
              label="품목종류"
              value={newData.itemType}
              onChange={(e) => setNewData((prev) => ({ ...prev, itemType: e.target.value }))}
            />
            <TextField
              fullWidth
              label="품명"
              value={newData.itemName}
              onChange={(e) => setNewData((prev) => ({ ...prev, itemName: e.target.value }))}
            />
            <SearchableSelect
              label="사양코드"
              options={specCode.map((row) => row.systemCode)}
              value={newData.specCode}
              onChange={(e) => setNewData((prev) => ({ ...prev, specCode: e.target.value }))}
            />
            <SearchableSelect
              label="EndBar"
              options={meterialCode.map((row) => row.materialCode)}
              value={newData.endBar}
              onChange={(e) => setNewData((prev) => ({ ...prev, endBar: e.target.value }))}
            />
            <TextField
              fullWidth
              label="폭(mm)"
              type="number"
              value={newData.width_mm}
              onChange={(e) =>
                setNewData((prev) => ({ ...prev, width_mm: parseInt(e.target.value, 10) || 0 }))
              }
            />
            <TextField
              fullWidth
              label="길이(mm)"
              type="number"
              value={newData.length_mm}
              onChange={(e) =>
                setNewData((prev) => ({ ...prev, length_mm: parseInt(e.target.value, 10) || 0 }))
              }
            />
            <TextField
              fullWidth
              label="CB 수"
              type="number"
              value={newData.cbCount}
              onChange={(e) =>
                setNewData((prev) => ({ ...prev, cbCount: parseInt(e.target.value, 10) || 0 }))
              }
            />
            <TextField
              fullWidth
              label="LEP(mm)"
              type="number"
              value={newData.lep_mm}
              onChange={(e) =>
                setNewData((prev) => ({ ...prev, lep_mm: parseInt(e.target.value, 10) || 0 }))
              }
            />
            <TextField
              fullWidth
              label="REP(mm)"
              type="number"
              value={newData.rep_mm}
              onChange={(e) =>
                setNewData((prev) => ({ ...prev, rep_mm: parseInt(e.target.value, 10) || 0 }))
              }
            />
            <TextField
              fullWidth
              label="수량"
              type="number"
              value={newData.quantity}
              onChange={(e) =>
                setNewData((prev) => ({ ...prev, quantity: parseInt(e.target.value, 10) || 0 }))
              }
            />
            <TextField
              fullWidth
              label="중량(Kg)"
              type="number"
              value={newData.weight_kg}
              onChange={(e) =>
                setNewData((prev) => ({ ...prev, weight_kg: parseFloat(e.target.value) || 0 }))
              }
            />
            <TextField
              fullWidth
              label="NE 중량(Kg)"
              type="number"
              value={newData.neWeight_kg}
              onChange={(e) =>
                setNewData((prev) => ({ ...prev, neWeight_kg: parseFloat(e.target.value) || 0 }))
              }
            />
          </Stack>
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button variant="outlined" onClick={handleAddModalClose}>
              취소
            </Button>
            <Button variant="contained" onClick={handleAddSave}>
              저장
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* 데이터 입력(템플릿) 모달 */}
      {isTemplateModalOpen && (
        <Modal open={isTemplateModalOpen} onClose={handleTemplateModalClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" mb={2}>
              데이터 입력
            </Typography>
            <Stack spacing={2}>
              <SearchableSelect
                label="사양코드"
                options={specCode.map((row) => row.systemCode)}
                value={selectedSpecific}
                onChange={(e) => setSelectedSpecific(e.target.value)}
              />
              <SearchableSelect
                label="EndBar"
                options={meterialCode.map((row) => row.materialCode)}
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              />
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" onClick={handleTemplateModalClose}>
                취소
              </Button>
              <Button
                variant="contained"
                onClick={handleDownloadTemplate}
                disabled={!selectedSpecific || !selectedMaterial}
              >
                양식 다운로드
              </Button>
            </Stack>
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default Condition;
