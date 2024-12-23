import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, IconButton, Stack, Button } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import AddIcon from '@mui/icons-material/Add';

const topColumns = [
  { field: 'taskNumber', headerName: '태스크번호', flex: 1 },
  { field: 'orderNumber', headerName: '수주번호', flex: 1 },
  { field: 'type', headerName: '구분', flex: 1 },
  { field: 'orderDate', headerName: '수주일자', flex: 1 },
  { field: 'clientName', headerName: '수주처명', flex: 1 },
  { field: 'deliveryDate', headerName: '납기일자', flex: 1 },
  { field: 'totalQuantity', headerName: '총수량', flex: 1 },
  { field: 'totalWeight', headerName: '총중량(Kg)', flex: 1 },
];

const bottomColumns = [
  { field: 'itemId', headerName: '품목 ID', flex: 1 },
  { field: 'drawingNumber', headerName: '도면번호', flex: 1 },
  { field: 'itemNumber', headerName: '품목번호', flex: 1 },
  { field: 'itemType', headerName: '품목종류', flex: 1 },
  { field: 'itemName', headerName: '품명', flex: 2 },
  { field: 'specCode', headerName: '사양코드', flex: 1 },
  { field: 'endBar', headerName: 'EndBar', flex: 1 },
  { field: 'width', headerName: '폭(mm)', flex: 1 },
  { field: 'length', headerName: '길이(mm)', flex: 1 },
  { field: 'cbCount', headerName: 'CB 수', flex: 1 },
  { field: 'lep', headerName: 'LEP(mm)', flex: 1 },
  { field: 'rep', headerName: 'REP(mm)', flex: 1 },
  { field: 'quantity', headerName: '수량', flex: 1 },
  { field: 'weight', headerName: '중량(Kg)', flex: 1 },
  { field: 'neWeight', headerName: 'NE 중량(Kg)', flex: 1 },
];

const Condition = () => {
  const [topData, setTopData] = useState([]);
  const [bottomData, setBottomData] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    axios
      .get('/api/order/list')
      .then((response) => {
        setTopData(response.data.table);
      })
      .catch((error) => console.error('Error fetching orders:', error));
  }, []);

  const handleRowClick = (params) => {
    const orderId = params.id;
    setSelectedOrderId(orderId);

    axios
      .get(`/api/orders/list/${orderId}`)
      .then((response) => {
        setBottomData(response.data.items || []);
      })
      .catch((error) => console.error('Error fetching order details:', error));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    axios
      .post('/api/upload/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        setBottomData(response.data.items || []);
      })
      .catch((error) => console.error('Error uploading file:', error));
  };

  return (
    <div>
      <PageContainer title="수주 및 품목 관리">
        <Grid container spacing={2}>
          {/* 상단 테이블 */}
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
                      whiteSpace: 'pre-wrap', // 줄바꿈 허용
                      textAlign: 'center', // 중앙 정렬
                      lineHeight: '1.2', // 줄 간격 조정
                    },
                    '& .MuiDataGrid-footerContainer': {
                      display: 'none', // 페이지네이션 숨기기
                    },
                  }}
                />
              </Box>
            </ParentCard>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          {/* 하단 테이블 */}
          <Grid item xs={12} mt={3}>
            <ParentCard title="수주별 품목명세 입력 화면">
              <Box sx={{ height: 'calc(40vh - 220px)', width: '100%' }}>
                <DataGrid
                  rows={bottomData}
                  columns={bottomColumns}
                  columnHeaderHeight={45}
                  rowHeight={30}
                  checkboxSelection
                  sx={{
                    '& .MuiDataGrid-columnHeaderTitle': {
                      whiteSpace: 'pre-wrap', // 줄바꿈 허용
                      textAlign: 'center', // 중앙 정렬
                      lineHeight: '1.2', // 줄 간격 조정
                    },
                    '& .MuiDataGrid-footerContainer': {
                      display: 'none', // 페이지네이션 숨기기
                    },
                  }}
                />
              </Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 1,
                      backgroundColor: 'primary.main',
                      color: '#fff',
                    }}
                  >
                    엑셀 업로드
                    <input type="file" hidden onChange={handleFileUpload} />
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    color="primary"
                    aria-label="save"
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 1,
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </div>
  );
};

export default Condition;
