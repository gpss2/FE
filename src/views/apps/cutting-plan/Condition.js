import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, Stack, Button, Typography, Modal, CircularProgress } from '@mui/material';
import { Checkbox, FormControlLabel } from '@mui/material';
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
  width: 1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
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

const topColumns = [
  indexColumn,
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
  indexColumn,
  {
    field: 'drawingNumber',
    headerName: '도면번호',
    editable: true,
    flex: 1,
    headerAlign: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'itemNo',
    headerName: '품목번호',
    editable: true,
    width: 100,
    headerAlign: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'itemType',
    headerName: '품목종류',
    editable: true,
    width: 100,
    headerAlign: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'itemName',
    headerName: '품명',
    editable: true,
    flex: 1,
    headerAlign: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'specCode',
    headerName: '사양코드',
    flex: 1,
    headerAlign: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'endBar',
    headerName: 'EndBar',
    flex: 1,
    headerAlign: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'width_mm',
    headerName: '폭\n(mm)',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'length_mm',
    headerName: '길이\n(mm)',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'cbCount',
    headerName: 'CB 수',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'lep_mm',
    headerName: 'LEP\n(mm)',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'rep_mm',
    headerName: 'REP\n(mm)',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'quantity',
    headerName: '수량',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'weight_kg',
    headerName: '중량\n(Kg)',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
  {
    field: 'neWeight_kg',
    headerName: 'NE\n중량',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
    cellClassName: (params) => (params.row.error ? 'error-cell' : ''),
  },
];

const recalcValues = (newData, oldData, C_PITCH) => {
  let source = '';
  if (newData.length_mm !== oldData.length_mm) {
    source = 'length_mm';
  } else if (newData.cbCount !== oldData.cbCount) {
    source = 'cbCount';
  } else if (newData.lep_mm !== oldData.lep_mm) {
    source = 'lep_mm';
  } else if (newData.rep_mm !== oldData.rep_mm) {
    source = 'rep_mm';
  } else {
    source = 'none';
  }

  let length_mm, cbCount, lep, rep;
  let errorFlag = false;

  if (source === 'length_mm') {
    length_mm = Number(newData.length_mm);
    cbCount = Math.floor(length_mm / C_PITCH) + 1;
    let total = length_mm - (cbCount - 1) * C_PITCH;
    lep = total / 2;
    rep = total / 2;
    while ((lep < 40 || rep < 40) && cbCount > 1) {
      cbCount--;
      total = length_mm - (cbCount - 1) * C_PITCH;
      lep = total / 2;
      rep = total / 2;
    }
    if (total >= 200) {
      errorFlag = true;
    }
  } else if (source === 'cbCount') {
    length_mm = Number(oldData.length_mm);
    cbCount = Number(newData.cbCount);
    let total = length_mm - (cbCount - 1) * C_PITCH;
    lep = total / 2;
    rep = total / 2;
    while ((lep < 40 || rep < 40) && cbCount > 1) {
      cbCount--;
      total = length_mm - (cbCount - 1) * C_PITCH;
      lep = total / 2;
      rep = total / 2;
    }
    if (total >= 200) {
      errorFlag = true;
    }
  } else if (source === 'lep_mm') {
    length_mm = Number(oldData.length_mm);
    cbCount = Number(oldData.cbCount);
    const total = length_mm - (cbCount - 1) * C_PITCH;
    const newLep = Number(newData.lep_mm);
    const newRep = total - newLep;
    lep = newLep;
    rep = newRep;
    if (newLep < 40 || newRep < 40 || total >= 200) {
      errorFlag = true;
    }
  } else if (source === 'rep_mm') {
    length_mm = Number(oldData.length_mm);
    cbCount = Number(oldData.cbCount);
    const total = length_mm - (cbCount - 1) * C_PITCH;
    const newRep = Number(newData.rep_mm);
    const newLep = total - newRep;
    lep = newLep;
    rep = newRep;
    if (newRep < 40 || newLep < 40 || total >= 200) {
      errorFlag = true;
    }
  } else {
    return { ...oldData, ...newData };
  }

  return {
    ...newData,
    length_mm,
    cbCount,
    lep_mm: lep,
    rep_mm: rep,
    error: errorFlag,
  };
};

const Condition = () => {
  const [topData, setTopData] = useState([]);
  const [bottomData, setBottomData] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState('');
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [meterialCode, setMeterialCode] = useState([]);
  const [specCode, setSpecCode] = useState([]);
  const [standardItems, setStandardItems] = useState([]); // 품명 목록 상태 추가
  const navigate = useNavigate();
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [applyLoading, setApplyLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedSpecific, setSelectedSpecific] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [templateDownloaded, setTemplateDownloaded] = useState(false);
  // 일괄변경 여부를 관리하는 상태 추가
  const [bulkUpdateOptions, setBulkUpdateOptions] = useState({
    itemType: false,
    itemName: false,
    specCode: false,
    endBar: false,
  });

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

  // 엔터키를 누를 때 기본 동작 대신 오른쪽 셀로 이동하는 핸들러
  const handleCellKeyDown = (params, event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentColIndex = bottomColumns.findIndex((col) => col.field === params.field);
      if (currentColIndex >= 0 && currentColIndex < bottomColumns.length - 1) {
        const nextCol = bottomColumns[currentColIndex + 1];
        const nextCell = document.querySelector(
          `[data-id="${params.id}"][data-field="${nextCol.field}"]`,
        );
        if (nextCell) {
          nextCell.click();
          nextCell.focus();
        }
      }
    }
  };

  // 추가 버튼 클릭 시 모달 대신 데이터 그리드에 빈 행 추가
  const handleAddRow = () => {
    let newDrawingNumber = '01';
    let newSpecCode = '';
    let newEndBar = '';
    if (bottomData.length > 0) {
      newDrawingNumber = bottomData[bottomData.length - 1].drawingNumber;
      newSpecCode = bottomData[bottomData.length - 1].specCode;
      newEndBar = bottomData[bottomData.length - 1].endBar;
    }
    const sameDrawingRows = bottomData.filter((row) => row.drawingNumber === newDrawingNumber);
    let newItemNo;
    if (sameDrawingRows.length > 0) {
      const maxItemNo = Math.max(...sameDrawingRows.map((row) => Number(row.itemNo) || 0));
      newItemNo = String(maxItemNo + 1);
    } else {
      newItemNo = '1';
    }
    const newRow = {
      id: 'new_' + new Date().getTime(),
      drawingNumber: newDrawingNumber,
      itemNo: newItemNo,
      itemType: 'R', // 기본값
      itemName: 'SteelGrating', // 기본값
      specCode: newSpecCode,
      endBar: newEndBar,
      width_mm: '',
      length_mm: '',
      cbCount: '',
      lep_mm: '',
      rep_mm: '',
      quantity: '',
      weight_kg: '',
      neWeight_kg: '',
      error: false,
    };
    setBottomData([...bottomData, newRow]);
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

  // 표준 품명 데이터를 가져오는 함수 (SteelGrating은 항상 포함)
  const fetchStandardItems = async () => {
    try {
      const response = await axios.get('/api/item/standard');
      setStandardItems(response.data.table);
    } catch (error) {
      console.error('Error fetching standard items:', error);
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
    fetchStandardItems();
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
      let processedData = response.data.table.map((row, index) => ({
        ...row,
        orderNumber: index + 1,
      }));
      let lastDrawingNumber = null;
      let group = 0;
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

  // 수정할 셀: specCode, endBar, itemType, itemName 모두 모달에서 편집하도록 수정
  const handleCellDoubleClick = (params) => {
    const { field, row } = params;
    if (['specCode', 'endBar', 'itemType', 'itemName'].includes(field)) {
      setModalData(row);
      setModalOpen(true);
    }
  };

  const handleProcessRowUpdate = (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;

    // 현재 행의 specCode에 해당하는 cWidth 값을 구합니다.
    const currentSpec = specCode.find((item) => item.systemCode === newRow.specCode);
    // 해당 값이 없으면 기본값 100을 사용합니다.
    const C_PITCH = currentSpec ? currentSpec.cWidth : 100;

    const recalculatedRow = recalcValues(newRow, oldRow, C_PITCH);
    setPendingUpdates((prev) => ({ ...prev, [newRow.id]: recalculatedRow }));
    return recalculatedRow;
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalData(null);
  };

  const handleSaveModal = () => {
    // 만약 하나라도 일괄 변경 체크가 되어있다면 모든 행에 반영
    if (
      bulkUpdateOptions.itemType ||
      bulkUpdateOptions.itemName ||
      bulkUpdateOptions.specCode ||
      bulkUpdateOptions.endBar
    ) {
      const updatedBottomData = bottomData.map((row) => {
        const newRow = { ...row };
        if (bulkUpdateOptions.itemType) newRow.itemType = modalData.itemType;
        if (bulkUpdateOptions.itemName) newRow.itemName = modalData.itemName;
        if (bulkUpdateOptions.specCode) newRow.specCode = modalData.specCode;
        if (bulkUpdateOptions.endBar) newRow.endBar = modalData.endBar;
        return newRow;
      });
      setBottomData(updatedBottomData);

      // pendingUpdates에도 동일하게 반영 (전체 행 업데이트)
      const newPendingUpdates = {};
      updatedBottomData.forEach((row) => {
        newPendingUpdates[row.id] = row;
      });
      setPendingUpdates(newPendingUpdates);
    } else {
      // 일괄 변경이 아닌 경우 기존처럼 모달에서 선택한 행만 업데이트
      const { id, specCode, endBar, itemType, itemName } = modalData;
      const updatedRow = { ...modalData, specCode, endBar, itemType, itemName };
      setPendingUpdates((prev) => ({ ...prev, [id]: updatedRow }));
      setBottomData((prev) => prev.map((row) => (row.id === id ? updatedRow : row)));
    }
    setModalOpen(false);
    // 저장 후 일괄변경 체크 상태 초기화
    setBulkUpdateOptions({
      itemType: false,
      itemName: false,
      specCode: false,
      endBar: false,
    });
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

  // 전체 삭제 핸들러 수정: 삭제 후 상단 테이블 갱신 추가
  const handleDeleteAll = () => {
    if (!selectedOrderId) return;
    axios
      .delete(`/api/plan/order-details/${selectedOrderId}`)
      .then(() => {
        setBottomData([]);
        fetchTopData(); // 상단 테이블 데이터 갱신
        alert('전체 삭제가 완료되었습니다.');
      })
      .catch((error) => console.error('Error deleting all rows:', error));
  };

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

  const handleCurrentDataDownload = async () => {
    if (!selectedOrderId) return;
    try {
      const response = await axios.get(`/api/plan/order-details/${selectedOrderId}/excel`, {
        responseType: 'blob',
      });
      const selectedOrder = topData.find((order) => order.id === selectedOrderId);
      const fileName = selectedOrder
        ? `${selectedOrder.orderNumber}-${selectedOrder.customerCode}.xlsx`
        : '현재데이터.xlsx';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('현재 데이터 다운로드 중 에러:', error);
    }
  };

  const handleTemplateUpload = async (event) => {
    if (!selectedOrderId) return;
    const file = event.target.files[0];
    if (!file) return;
    setUploadLoading(true);
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
    setUploadLoading(false);
  };

  const handleBulkSave = async () => {
    setApplyLoading(true);
    const invalidMessages = [];
    // bottomData 배열을 순회하면서 각 행에 대해 에러 체크를 진행합니다.
    const updatedBottomData = bottomData.map((row, index) => {
      // pendingUpdates가 존재하면 해당 업데이트 내용을 병합합니다.
      const updatedRow = pendingUpdates[row.id] ? { ...row, ...pendingUpdates[row.id] } : row;
      let hasError = false;
      const requiredFields = ['itemType', 'itemName', 'specCode', 'endBar'];

      // 필수 필드에 대해 빈 값이 있는지 체크합니다.
      requiredFields.forEach((field) => {
        if (!updatedRow[field] || updatedRow[field].toString().trim() === '') {
          invalidMessages.push(`인덱스 ${index + 1} 에 대해 누락된 값이 있습니다. (${field})`);
          hasError = true;
        }
      });

      // 기존 조건: LEP와 REP의 합이 200 이상이면 에러 처리
      const sum = Number(updatedRow.lep_mm) + Number(updatedRow.rep_mm);
      if (sum >= 200) {
        invalidMessages.push(`인덱스 ${index + 1} (품목번호: ${updatedRow.itemNo}) - 잘못된 입력`);
        hasError = true;
      }

      return { ...updatedRow, error: hasError };
    });

    // 에러 메시지가 하나라도 있다면 저장을 중단하고 에러 메시지를 출력합니다.
    if (invalidMessages.length > 0) {
      setBottomData(updatedBottomData);
      alert(invalidMessages.join('\n'));
      setApplyLoading(false);
      return;
    }

    try {
      const updates = Object.values(pendingUpdates);
      const updatePromises = updates.map((row) => {
        if (String(row.id).startsWith('new_')) {
          return axios.post(`/api/plan/order-details/${selectedOrderId}`, row);
        } else {
          return axios.put(`/api/plan/order-details/${selectedOrderId}/${row.id}`, row);
        }
      });
      await Promise.all(updatePromises);
      await fetchBottomData(selectedOrderId);
      setPendingUpdates({});
      alert('적용되었습니다.');
    } catch (error) {
      console.error('Error saving updates:', error);
    }
    setApplyLoading(false);
  };

  return (
    <div>
      <PageContainer title="수주 및 품목 관리">
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard title="수주 선택">
              <Box sx={{ height: 'calc(50vh)', width: '100%' }}>
                <DataGrid
                  rows={topData}
                  columns={topColumns}
                  columnHeaderHeight={30}
                  rowHeight={25}
                  onRowClick={handleRowClick}
                  disableSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-cell': { border: '1px solid black', fontSize: '12px' },
                    '& .MuiDataGrid-columnHeader': { fontSize: '12px', backgroundColor: '#f5f5f5' },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      textAlign: 'center',
                      whiteSpace: 'pre-wrap',
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
                  disabled={!selectedOrderId || uploadLoading}
                  onClick={handleTemplateModalOpen}
                >
                  {uploadLoading ? <CircularProgress size={24} color="inherit" /> : 'BOM 생성'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCurrentDataDownload}
                  disabled={!selectedOrderId}
                >
                  BOM 다운로드
                </Button>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard
              title={`수주별 품목명세 입력 화면 ${selectedOrderNumber ? selectedOrderNumber : ''}`}
            >
              <Box sx={{ height: 'calc(50vh)', width: '100%' }}>
                <DataGrid
                  rows={bottomData}
                  columns={bottomColumns}
                  processRowUpdate={handleProcessRowUpdate}
                  disableSelectionOnClick
                  getRowId={(row) => row.id}
                  onRowClick={(params) => setSelectedDetailId(params.id)}
                  experimentalFeatures={{ newEditingApi: true }}
                  onCellDoubleClick={handleCellDoubleClick}
                  onCellKeyDown={handleCellKeyDown}
                  getRowClassName={(params) => (params.row.group === 0 ? 'group0' : 'group1')}
                  columnHeaderHeight={30}
                  rowHeight={25}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      border: '1px solid black',
                      fontSize: '12px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                    },
                    '& .MuiDataGrid-columnHeader': { fontSize: '12px', backgroundColor: '#f5f5f5' },
                    '& .group0': { backgroundColor: '#ffffff' },
                    '& .group1': { backgroundColor: '#f5f5f5' },
                    '& .error-cell': { backgroundColor: 'red', color: 'white' },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      textAlign: 'center',
                      whiteSpace: 'pre-wrap',
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
                <Button
                  variant="contained"
                  component="label"
                  disabled={!selectedOrderId || uploadLoading}
                >
                  {uploadLoading ? <CircularProgress size={24} color="inherit" /> : 'BOM 업로드'}
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
                  onClick={handleAddRow}
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
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteAll}
                  disabled={!selectedOrderId}
                >
                  전체 삭제
                </Button>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>

      {modalData && (
        <Modal open={isModalOpen} onClose={handleModalClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" mb={2}>
              데이터 수정
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <SearchableSelect
                  label="품목 종류"
                  options={[
                    'R',
                    'C',
                    'Angle 대',
                    'Angle 소',
                    'EndBar',
                    'GB',
                    '각 Pipe',
                    '특수 Type',
                  ]}
                  value={modalData.itemType}
                  onChange={(e) => setModalData((prev) => ({ ...prev, itemType: e.target.value }))}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bulkUpdateOptions.itemType}
                      onChange={(e) =>
                        setBulkUpdateOptions((prev) => ({
                          ...prev,
                          itemType: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="일괄 변경"
                />
              </Grid>
              <Grid item xs={3}>
                <SearchableSelect
                  label="품명"
                  options={['SteelGrating', ...standardItems.map((row) => row.itemName)]}
                  value={modalData.itemName}
                  onChange={(e) => setModalData((prev) => ({ ...prev, itemName: e.target.value }))}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bulkUpdateOptions.itemName}
                      onChange={(e) =>
                        setBulkUpdateOptions((prev) => ({
                          ...prev,
                          itemName: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="일괄 변경"
                />
              </Grid>
              <Grid item xs={3}>
                <SearchableSelect
                  label="사양코드"
                  options={specCode.map((row) => row.systemCode)}
                  value={modalData.specCode}
                  onChange={(e) => setModalData((prev) => ({ ...prev, specCode: e.target.value }))}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bulkUpdateOptions.specCode}
                      onChange={(e) =>
                        setBulkUpdateOptions((prev) => ({
                          ...prev,
                          specCode: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="일괄 변경"
                />
              </Grid>
              <Grid item xs={3}>
                <SearchableSelect
                  label="EndBar"
                  options={meterialCode.map((row) => row.materialCode)}
                  value={modalData.endBar}
                  onChange={(e) => setModalData((prev) => ({ ...prev, endBar: e.target.value }))}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bulkUpdateOptions.endBar}
                      onChange={(e) =>
                        setBulkUpdateOptions((prev) => ({
                          ...prev,
                          endBar: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="일괄 변경"
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

      {isTemplateModalOpen && (
        <Modal open={isTemplateModalOpen} onClose={handleTemplateModalClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" mb={2}>
              수주번호 " {selectedOrderNumber} " 에서 사용할 사양코드와 EndBar를 선택해주세요.
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
