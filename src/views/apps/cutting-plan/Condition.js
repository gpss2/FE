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

// lep_mm, rep_mm 에 cellClassName 추가(오류 발생 시 'error-cell' 클래스를 부여)
const bottomColumns = [
  {
    field: 'drawingNumber',
    headerName: '도면번호',
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'itemNo',
    headerName: '품목번호',
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'itemType',
    headerName: '품목종류',
    editable: true,
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'itemName',
    headerName: '품명',
    editable: true,
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'specCode',
    headerName: '사양코드',
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'endBar',
    headerName: 'EndBar',
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'width_mm',
    headerName: '폭(mm)',
    editable: true,
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'length_mm',
    headerName: '길이(mm)',
    editable: true,
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'cbCount',
    headerName: 'CB 수',
    editable: true,
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'lep_mm',
    headerName: 'LEP(mm)',
    editable: true,
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'rep_mm',
    headerName: 'REP(mm)',
    editable: true,
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'quantity',
    headerName: '수량',
    editable: true,
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'weight_kg',
    headerName: '중량(Kg)',
    editable: true,
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'neWeight_kg',
    headerName: 'NE 중량(Kg)',
    editable: true,
    flex: 1,
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
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
  // pendingUpdates 상태 : 수정된 데이터들을 누적해서 저장
  const [pendingUpdates, setPendingUpdates] = useState({});

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

  // 하단 데이터 fetch 시 도면번호가 바뀔 때마다 group 값을 부여하여 그룹별 색상 처리
  const fetchBottomData = async (orderId) => {
    try {
      const response = await axios.get(`/api/plan/order-details/${orderId}`);
      let processedData = response.data.table.map((row, index) => ({
        ...row,
        orderNumber: index + 1,
      }));
      let lastDrawingNumber = null;
      let group = 0; // 0,1 두 그룹을 번갈아 사용
      processedData = processedData.map((row) => {
        if (row.drawingNumber !== lastDrawingNumber) {
          group = group === 0 ? 1 : 0;
          lastDrawingNumber = row.drawingNumber;
        }
        return { ...row, group };
      });
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
      length_mm = Number(newData.length_mm);
      cbCount = Math.floor(length_mm / 100) + 1;
      let baseValue = (length_mm - (cbCount - 1) * 100) / 2;
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
      lep = source === 'lep_mm' ? Number(newData.lep_mm) : Number(newData.rep_mm);
      rep = lep;
      cbCount =
        newData.cbCount !== undefined && newData.cbCount !== null
          ? Number(newData.cbCount)
          : Math.floor(Number(newData.length_mm) / 100) + 1;
      length_mm = (cbCount - 1) * 100 + 2 * lep;

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
        lep = rep = lep < baseValue ? baseValue : lep;
      }
    }

    return {
      ...newData,
      length_mm,
      cbCount,
      lep_mm: lep,
      rep_mm: rep,
    };
  };

  // 그리드 인라인 수정 시 바로 PUT 요청 대신 pendingUpdates에 저장
  const handleProcessRowUpdate = (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;
    const recalculatedRow = recalcValues(newRow, oldRow);
    setPendingUpdates((prev) => ({ ...prev, [newRow.id]: recalculatedRow }));
    return recalculatedRow;
  };

  // 사양코드 혹은 EndBar 셀 더블클릭 시 모달을 열어 수정하고, 변경내용은 pendingUpdates에 저장
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

  const handleSaveModal = () => {
    const { id, specCode, endBar } = modalData;
    const updatedRow = { ...modalData, specCode, endBar };
    setPendingUpdates((prev) => ({ ...prev, [id]: updatedRow }));
    setBottomData((prev) => prev.map((row) => (row.id === id ? updatedRow : row)));
    setModalOpen(false);
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
      const selectedOrder = topData.find((order) => order.id === selectedOrderId);
      const fileName = selectedOrder
        ? `${selectedOrder.orderNumber}-${selectedOrder.customerCode}.xlsx`
        : 'excel-template.xlsx';
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

  // 누적된 pendingUpdates에 대해 유효성 검사 후 업데이트 적용 (Bulk Save)
  const handleBulkSave = async () => {
    const invalidMessages = [];
    // pendingUpdates에 저장된 각 행의 lep와 rep 합 검사 후 error 플래그 적용
    const updatedBottomData = bottomData.map((row) => {
      if (pendingUpdates[row.id]) {
        const updatedRow = pendingUpdates[row.id];
        const sum = Number(updatedRow.lep_mm) + Number(updatedRow.rep_mm);
        if (sum >= 200) {
          invalidMessages.push(`${updatedRow.itemNo} - 잘못된 입력`);
          return { ...row, error: true };
        } else {
          return { ...row, error: false };
        }
      }
      return row;
    });
    if (invalidMessages.length > 0) {
      setBottomData(updatedBottomData);
      alert(invalidMessages.join('\n'));
      return;
    }

    try {
      const updates = Object.values(pendingUpdates);
      const updatePromises = updates.map((row) =>
        axios.put(`/api/plan/order-details/${selectedOrderId}/${row.id}`, row),
      );
      await Promise.all(updatePromises);
      await fetchBottomData(selectedOrderId);
      setPendingUpdates({});
      alert('적용되었습니다.');
    } catch (error) {
      console.error('Error saving updates:', error);
    }
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
                    '& .MuiDataGrid-cell': {
                      border: '1px solid black',
                      fontSize: '1.2rem',
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '1.0rem',
                    },
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
                  // 행의 배경색은 도면번호 그룹에 따라 결정 (getRowClassName 사용)
                  getRowClassName={(params) => (params.row.group === 0 ? 'group0' : 'group1')}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      border: '1px solid black',
                      fontSize: '1.2rem',
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '1.0rem',
                    },
                    // 그룹별 배경색 지정
                    '& .group0': { backgroundColor: '#ffffff' },
                    '& .group1': { backgroundColor: '#f5f5f5' },
                    // 오류가 있는 셀에 대해 빨간색 배경 (글자색 대비를 위해 white)
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
                  disabled={Object.keys(pendingUpdates).length === 0}
                >
                  적용
                </Button>
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
              <Button variant="contained" onClick={handleSaveModal}>
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
