import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, IconButton, Stack, Button, Typography, Modal, TextField } from '@mui/material';
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
  // { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'drawingNumber', headerName: '도면번호', flex: 1 },
  { field: 'id', headerName: '품목번호', flex: 1 },
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
  const handleAddModalOpen = () => {
    // 하단 테이블 데이터가 있는지 확인
    const lastData = bottomData[bottomData.length - 1];
    const nextDrawingNumber = lastData
      ? String(Number(lastData.drawingNumber)).padStart(2, '0')
      : '01';
    const nextOrderNumber = lastData ? String(Number(lastData.orderNumber) + 1) : '1';

    // 새로운 데이터의 초기값 설정
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
        orderNumber: index + 1, // 1부터 시작하는 번호
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
  const handleProcessRowUpdate = async (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow; // 변경 없을 경우

    try {
      await axios.put(`/api/plan/order-details/${selectedOrderId}/${newRow.id}`, newRow);
      await fetchBottomData(selectedOrderId); // 업데이트 후 하단 데이터 갱신
      await fetchTopData(); // 업데이트 후 상단 데이터 갱신
      return newRow;
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
        fetchBottomData();
        setBottomData((prev) => prev.filter((row) => row.id !== selectedDetailId));
        setSelectedDetailId(null);
      })
      .catch((error) => console.error('Error deleting row:', error));
  };
  const handleFileUpload = async (event) => {
    if (!selectedOrderId) return;
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`/api/plan/order-details/${selectedOrderId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await fetchBottomData(selectedOrderId); // 업로드 후 하단 데이터 갱신
    } catch (error) {
      console.error('Error uploading file:', error);
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
                    '& .MuiDataGrid-columnHeaderTitle': {
                      whiteSpace: 'pre-wrap',
                      textAlign: 'center',
                      lineHeight: '1.2',
                    },
                    '& .MuiDataGrid-footerContainer': {
                      display: 'none',
                    },
                  }}
                />
              </Box>
            </ParentCard>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard
              title={`수주별 품목명세 입력 화면${
                selectedOrderNumber ? ` : ${selectedOrderNumber}` : ''
              }`}
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
                    '& .MuiDataGrid-columnHeaderTitle': {
                      whiteSpace: 'pre-wrap',
                      textAlign: 'center',
                      lineHeight: '1.2',
                    },
                    '& .MuiDataGrid-footerContainer': {
                      display: 'none',
                    },
                  }}
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" mb={1} spacing={2}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  disabled={!selectedOrderId}
                >
                  CSV 업로드
                  <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
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
            {/* STRING 타입 필드 */}
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

            {/* INTEGER 타입 필드 */}
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

            {/* FLOAT 타입 필드 */}
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
    </div>
  );
};

export default Condition;
